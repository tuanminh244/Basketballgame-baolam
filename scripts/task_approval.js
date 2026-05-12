const { adminDb } = require('./shared/firebaseAdmin');
const logger = require('./shared/logger');
const { aggregateRewards } = require('./engine/rewardEngine');
const { calculateLevel } = require('./engine/levelEngine');
const { calculateNextStreak } = require('./engine/streakEngine');
const { calculateSafeBalance } = require('./engine/economyEngine');

/**
 * CRON-BASED ECONOMY ENGINE (Chạy mỗi 5 phút)
 * Compatibility: ECONOMY_LOCK, FIREBASE_SCHEMA_LOCK, COREGAME_LOCK
 * Architecture: Two-Step Commit (1. Transactional Ledger Lock -> 2. Wallet Multipath Update)
 */
async function processTaskApprovals() {
  logger.info('Starting Task Approval (Economy) Engine...');
  
  try {
    const configSnap = await adminDb.ref('system_config').get();
    const configData = configSnap.val() || {};
    const currentMonthKey = configData.current_month_node;
    const levelThresholds = configData.level_thresholds || {};

    if (!currentMonthKey) {
       logger.warn('system_config/current_month_node not found');
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
            
            // BƯỚC 1: TRANSACTIONAL LEDGER RECONCILIATION
            const txResult = await summaryRef.transaction((summary) => {
               if (!summary) return null;

               const { totalApprovedXp, totalApprovedPoints, deltaXp, deltaPoints } = aggregateRewards(data.tasks, summary);
               
               if (deltaXp <= 0 && deltaPoints <= 0) {
                   return undefined; // Ngăn ngừa lặp grant reward (Abort cleanly)
               }

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

               if (newRate >= 78) {
                   summary.reward_78_unlocked = true;
               }
               if (newRate >= 100) {
                   summary.reward_100_unlocked = true;
               }

               if (newRate === 100) {
                   summary.status = 'completed';
               } else if (newRate > 0) {
                   summary.status = 'partial';
               }

               return summary;
            });

            // BƯỚC 2: WALLET MULTIPATH UPDATE
            if (txResult.committed) {
               const preTxSummary = data.summary;
               const postTxSummary = txResult.snapshot.val();
               
               const finalDeltaXp = (postTxSummary.xp_granted || 0) - (preTxSummary.xp_granted || 0);
               const finalDeltaPoints = (postTxSummary.points_granted || 0) - (preTxSummary.points_granted || 0);

               if (finalDeltaXp > 0 || finalDeltaPoints > 0) {
                   let nextStreak = currentStats.current_streak || 0;
                   let bonusPoints = 0;
                   let updateStreak = false;

                   const reward78JustUnlocked = !preTxSummary.reward_78_unlocked && postTxSummary.reward_78_unlocked;

                   // Kích hoạt chuỗi (Streak) dựa vào Rate Của HÔM QUA khi HÔM NAY chạm 78% lần đầu
                   if (dateKey === todayKey && reward78JustUnlocked) {
                       const ySnap = await adminDb.ref(`${yesterdayMonthKey}/${yesterdayKey}/${uid}/summary`).get();
                       const yesterdayRate = ySnap.exists() ? (ySnap.val().completion_rate || 0) : 0;

                       nextStreak = calculateNextStreak(currentStats.current_streak || 0, yesterdayRate);
                       updateStreak = true;

                       if (nextStreak === 7 && (currentStats.current_streak || 0) < 7) {
                           bonusPoints += 50;
                       }
                       if (nextStreak === 30 && (currentStats.current_streak || 0) < 30) {
                           bonusPoints += 300;
                       }
                   }

                   const newXp = currentStats.current_xp + finalDeltaXp;
                   // Dùng economyEngine để chống âm tài khoản an toàn tuyệt đối
                   const newPoints = calculateSafeBalance(currentStats.total_points, finalDeltaPoints + bonusPoints);
                   const newLevel = calculateLevel(newXp, levelThresholds);

                   const updates = {
                       [`users/${uid}/stats/current_xp`]: newXp,
                       [`users/${uid}/stats/total_points`]: newPoints,
                       [`users/${uid}/stats/level`]: newLevel
                   };

                   if (updateStreak) {
                       updates[`users/${uid}/stats/current_streak`] = nextStreak;
                   }

                   await adminDb.ref().update(updates);
                   
                   let logMsg = `Granted Delta cho ${uid} (${dateKey}): +${finalDeltaXp} XP, +${finalDeltaPoints} Points`;
                   if (bonusPoints > 0) logMsg += ` (kèm ${bonusPoints} Streak Bonus)`;
                   logger.success(logMsg);
               }
            }
          } catch (userErr) {
            logger.error(`Error processing user ${uid} on ${dateKey}:`, userErr);
            continue; 
          }
        }
    }

    logger.success('Economy Engine cycle completed.');
  } catch (err) {
    logger.error('Economy Engine Critical Error:', err);
  }
}

if (require.main === module) {
  processTaskApprovals();
}

module.exports = processTaskApprovals;
