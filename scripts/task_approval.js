const admin = require('firebase-admin');
const { adminDb } = require('./shared/firebaseAdmin');
const logger = require('./shared/logger');
const { aggregateRewards } = require('./engine/rewardEngine');
const { calculateLevel } = require('./engine/levelEngine');
const { calculateNextStreak } = require('./engine/streakEngine');

/**
 * CRON-BASED ECONOMY ENGINE (Chạy mỗi 5 phút)
 * Compatibility: ECONOMY_LOCK, FIREBASE_SCHEMA_LOCK, COREGAME_LOCK
 * Architecture: Two-Step Commit (1. Transactional Ledger Lock -> 2. Wallet Multipath Update)
 */
async function processTaskApprovals() {
  const executionId = Date.now();
  logger.info(`[${executionId}] Starting Task Approval (Economy) Engine...`);
  
  try {
    const configSnap = await adminDb.ref('system_config').get();
    const configData = configSnap.val() || {};
    const currentMonthKey = configData.current_month_node;
    const levelThresholds = configData.level_thresholds || {};

    if (!currentMonthKey) {
       logger.warn(`[${executionId}] system_config/current_month_node not found`);
       return;
    }

    // Offset timezone to Asia/Ho_Chi_Minh (+7 UTC)
    const offset = 7 * 60 * 60 * 1000;
    const now = Date.now();
    
    // TODAY
    const localDate = new Date(now + offset);
    const yyyy = localDate.getUTCFullYear();
    const mm = String(localDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(localDate.getUTCDate()).padStart(2, '0');
    const todayKey = `${yyyy}-${mm}-${dd}`;

    // YESTERDAY
    const yesterday = new Date(now + offset - 24 * 60 * 60 * 1000);
    const y_yyyy = yesterday.getUTCFullYear();
    const y_mm = String(yesterday.getUTCMonth() + 1).padStart(2, '0');
    const y_dd = String(yesterday.getUTCDate()).padStart(2, '0');
    const yesterdayKey = `${y_yyyy}-${y_mm}-${y_dd}`;
    const yesterdayMonthKey = `daily_logs_${y_yyyy}_${y_mm}`;

    // BOUNDARY BUG FIX: Tránh Crash do Retroactive Approval vượt biên giới tháng
    const dateToMonthKey = {
      [todayKey]: currentMonthKey,
      [yesterdayKey]: yesterdayMonthKey
    };

    const targetDates = [todayKey, yesterdayKey];

    for (const dateKey of targetDates) {
        const monthKeyForDate = dateToMonthKey[dateKey];
        
        const logsRef = adminDb.ref(`${monthKeyForDate}/${dateKey}`);
        const logsSnap = await logsRef.get();
        
        if (!logsSnap.exists()) continue;

        const usersData = logsSnap.val();
        
        for (const uid in usersData) {
          // Fail-safe isolation: Lỗi user này không làm sập tiến trình user khác
          try {
            const data = usersData[uid];
            if (!data.tasks || !data.summary) continue;

            const userStatsSnap = await adminDb.ref(`users/${uid}/stats`).get();
            const currentStats = userStatsSnap.val() || {
                current_xp: 0,
                total_points: 0,
                level: 1,
                current_streak: 0
            };
            
            const summaryRef = adminDb.ref(`${monthKeyForDate}/${dateKey}/${uid}/summary`);
            
            // [FIX STALE DELTA]: Khai báo state nhận delta chuẩn trước transaction
            let committedDeltaXp = 0;
            let committedDeltaPoints = 0;

            // [FIX STALE REWARD_78]: Khai báo state nhận event unlock trước transaction
            let reward78JustUnlocked = false;
            
            // BƯỚC 1: TRANSACTIONAL LEDGER RECONCILIATION
            const txResult = await summaryRef.transaction((summary) => {
               if (!summary) return null;

               const { totalApprovedXp, totalApprovedPoints } = aggregateRewards(data.tasks, summary);
               
               // Tính delta bằng live state BÊN TRONG transaction
               committedDeltaXp = totalApprovedXp - (summary.xp_granted || 0);
               committedDeltaPoints = totalApprovedPoints - (summary.points_granted || 0);

               // Recalculate thực tế completion_rate từ tasks snapshot
               const tasks = data.tasks;
               let approvedCount = 0;
               let totalCount = 0;
               if (tasks) {
                 for (const taskId of Object.keys(tasks)) {
                   totalCount++;
                   if (tasks[taskId].status === 'approved') {
                     approvedCount++;
                   }
                 }
               }
               const newRate = totalCount > 0 ? Math.floor((approvedCount / totalCount) * 100) : 0;
               
               summary.xp_granted = totalApprovedXp;
               summary.points_granted = totalApprovedPoints;
               summary.completion_rate = newRate;

               // Tính toán cờ unlock từ LIVE summary state (Chống Stale Snapshot Double Bonus)
               const wasReward78Unlocked = summary.reward_78_unlocked === true;
               const shouldUnlock78 = newRate >= 78;

               // Reset về false mỗi lần transaction retry để đảm bảo idempotent tuyệt đối
               reward78JustUnlocked = false;
               if (!wasReward78Unlocked && shouldUnlock78) {
                   reward78JustUnlocked = true;
               }

               if (shouldUnlock78) {
                   summary.reward_78_unlocked = true;
               }
               if (newRate >= 100) {
                   summary.reward_100_unlocked = true;
               }

               // Cập nhật chuẩn xác status
               if (newRate === 100) {
                   summary.status = 'completed';
               } else if (newRate > 0) {
                   summary.status = 'partial';
               } else {
                   summary.status = 'ongoing';
               }

               return summary;
            });

            // BƯỚC 2: WALLET MULTIPATH UPDATE
            if (txResult.committed) {
               // Gán final delta chuẩn (đã bypass outer stale cache)
               const finalDeltaXp = committedDeltaXp;
               const finalDeltaPoints = committedDeltaPoints;
               
               if (finalDeltaXp <= 0 && finalDeltaPoints <= 0) {
                   continue; 
               }

               let nextStreak = currentStats.current_streak || 0;
               let bonusPoints = 0;
               let updateStreak = false;

               // Kích hoạt chuỗi (Streak) dựa vào Rate Của HÔM QUA khi HÔM NAY chạm 78% lần đầu
               // Sử dụng biến reward78JustUnlocked đã được xác thực an toàn bên trong transaction
               if (dateKey === todayKey && reward78JustUnlocked) {
                   const ySnap = await adminDb.ref(`${yesterdayMonthKey}/${yesterdayKey}/${uid}/summary`).get();
                   const yesterdayRate = ySnap.exists() ? (ySnap.val().completion_rate || 0) : 0;

                   // [FIX STREAK BOOLEAN]: Evaluate thành boolean trước khi truyền vào engine
                   nextStreak = calculateNextStreak(currentStats.current_streak || 0, yesterdayRate >= 78);
                   updateStreak = true;

                   if (nextStreak === 7 && (currentStats.current_streak || 0) < 7) {
                       bonusPoints += 50;
                   }
                   if (nextStreak === 30 && (currentStats.current_streak || 0) < 30) {
                       bonusPoints += 300;
                   }
               }

               // Level được tính an toàn từ snapshot (Stale data ở đây không nguy hiểm)
               const approximateNewXp = currentStats.current_xp + finalDeltaXp;
               const newLevel = calculateLevel(approximateNewXp, levelThresholds);

               // Sử dụng increment để cập nhật Wallet an toàn tuyệt đối chống Race Condition
               const updates = {
                   [`users/${uid}/stats/current_xp`]: admin.database.ServerValue.increment(finalDeltaXp),
                   [`users/${uid}/stats/total_points`]: admin.database.ServerValue.increment(finalDeltaPoints + bonusPoints),
                   [`users/${uid}/stats/level`]: newLevel
               };

               if (updateStreak) {
                   updates[`users/${uid}/stats/current_streak`] = nextStreak;
               }

               // Cập nhật Wallet cách ly với Try/Catch bảo vệ trạng thái Orphan
               try {
                   await adminDb.ref().update(updates);
                   
                   let logMsg = `[${executionId}] Granted Delta cho ${uid} (${dateKey}): +${finalDeltaXp} XP, +${finalDeltaPoints} Points`;
                   if (bonusPoints > 0) logMsg += ` (kèm ${bonusPoints} Streak Bonus)`;
                   logger.success(logMsg);
               } catch (walletErr) {
                   logger.error(`[${executionId}] ORPHAN_STATE: Ledger committed but Wallet update failed!`, { 
                       uid, 
                       dateKey, 
                       finalDeltaXp, 
                       finalDeltaPoints,
                       bonusPoints,
                       error: walletErr.message 
                   });
               }
            }
          } catch (userErr) {
            logger.error(`[${executionId}] Error processing user ${uid} on ${dateKey}:`, userErr);
            continue; 
          }
        }
    }

    logger.success(`[${executionId}] Economy Engine cycle completed.`);
  } catch (err) {
    logger.error(`[${executionId}] Economy Engine Critical Error:`, err);
  }
}

if (require.main === module) {
  processTaskApprovals();
}

module.exports = processTaskApprovals;
