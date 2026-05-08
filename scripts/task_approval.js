const admin = require("firebase-admin");

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} catch (e) {
  console.error("Firebase init failed:", e);
  process.exit(1);
}

const db = admin.database();

function getVietnamDateStr(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getMonthNodeForDate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  return `daily_logs_${yyyy}_${mm}`;
}

function calculateLevel(currentXp, thresholds) {
  let matchedLevel = 1;
  const sortedLevels = Object.keys(thresholds).map(Number).sort((a, b) => a - b);
  for (const lvl of sortedLevels) {
    if (currentXp >= thresholds[lvl]) {
      matchedLevel = lvl;
    } else {
      break;
    }
  }
  return matchedLevel;
}

(async () => {
  try {
    const configSnap = await db.ref("system_config").once("value");
    const config = configSnap.val();
    if (!config || !config.level_thresholds) throw new Error("Missing system_config or level_thresholds");

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnTodayObj = new Date(utc + 7 * 60 * 60 * 1000);
    const vnYesterdayObj = new Date(vnTodayObj.getTime() - 86400000);

    const checkDates = [
      { date: getVietnamDateStr(vnYesterdayObj), node: getMonthNodeForDate(vnYesterdayObj) },
      { date: getVietnamDateStr(vnTodayObj), node: getMonthNodeForDate(vnTodayObj) }
    ];

    for (const { date, node } of checkDates) {
      const logsSnap = await db.ref(`${node}/${date}`).once("value");
      const logs = logsSnap.val() || {};

      for (const [userId, logData] of Object.entries(logs)) {
        if (!logData.tasks) continue;

        let totalTasks = 0;
        let approvedTasks = 0;
        let approvedXp = 0;
        let approvedPoints = 0;

        Object.values(logData.tasks).forEach((task) => {
          totalTasks++;
          if (task.status === "approved") {
            approvedTasks++;
            approvedXp += task.xp_earned;
            approvedPoints += task.point_earned;
          }
        });

        const completion_rate = totalTasks > 0 ? Math.floor((approvedTasks / totalTasks) * 100) : 0;
        const summaryRef = db.ref(`${node}/${date}/${userId}/summary`);

        let deltaXpToApply = 0;
        let deltaPointsToApply = 0;
        let streakAction = null; 

        const transactionResult = await summaryRef.transaction((curr) => {
          if (curr === null) return curr;

          deltaXpToApply = approvedXp - (curr.xp_granted || 0);
          deltaPointsToApply = approvedPoints - (curr.points_granted || 0);
          streakAction = null;

          let unlock78 = curr.reward_78_unlocked || false;
          let unlock100 = curr.reward_100_unlocked || false;

          if (completion_rate >= 78 && !unlock78) {
            unlock78 = true;
            streakAction = 'process_78';
          }
          if (completion_rate === 100 && !unlock100) {
            unlock100 = true;
          }

          if (deltaXpToApply === 0 && deltaPointsToApply === 0 && curr.completion_rate === completion_rate && !streakAction && curr.reward_100_unlocked === unlock100) {
            return; 
          }

          curr.xp_granted = approvedXp;
          curr.points_granted = approvedPoints;
          curr.completion_rate = completion_rate;
          curr.reward_78_unlocked = unlock78;
          curr.reward_100_unlocked = unlock100;

          return curr;
        });

        let finalDeltaXp = (transactionResult && transactionResult.committed) ? deltaXpToApply : 0;
        let finalDeltaPoints = (transactionResult && transactionResult.committed) ? deltaPointsToApply : 0;
        let updateStreak = false;

        const userStatsRef = db.ref(`users/${userId}/stats`);
        const userStatsSnap = await userStatsRef.once("value");
        const userStats = userStatsSnap.val() || { current_xp: 0, total_points: 0, current_streak: 1, level: 1 };
        
        let newStreak = userStats.current_streak || 1;

        if (transactionResult && transactionResult.committed && streakAction === 'process_78') {
          const logDateObj = new Date(date);
          const prevDateObj = new Date(logDateObj.getTime() - 86400000);
          const pDateStr = getVietnamDateStr(prevDateObj);
          const pNode = getMonthNodeForDate(prevDateObj);

          const prevSummarySnap = await db.ref(`${pNode}/${pDateStr}/${userId}/summary/completion_rate`).once('value');
          const yesterdayRate = prevSummarySnap.val() || 0;

          if (yesterdayRate >= 78) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
          updateStreak = true;

          if (newStreak === 7) finalDeltaPoints += 50;
          if (newStreak === 30) finalDeltaPoints += 300;
        } else if (date === checkDates[0].date && completion_rate < 78 && newStreak !== 1) {
          newStreak = 1;
          updateStreak = true;
        }

        if (finalDeltaXp > 0 || finalDeltaPoints > 0 || updateStreak) {
          const newTotalXp = (userStats.current_xp || 0) + finalDeltaXp;
          const newTotalPoints = (userStats.total_points || 0) + finalDeltaPoints;
          const newLevel = calculateLevel(newTotalXp, config.level_thresholds);

          const userUpdates = {
            current_xp: newTotalXp,
            total_points: newTotalPoints,
            current_streak: newStreak
          };

          if (newLevel > (userStats.level || 1)) {
            userUpdates.level = newLevel;
          }

          await userStatsRef.update(userUpdates);
          console.log(`Economy Processed for ${userId} on ${date} | DeltaXP: ${finalDeltaXp} | Pts: ${finalDeltaPoints} | Streak: ${newStreak} | Rate: ${completion_rate}%`);
        }
      }
    }
    
    console.log("Economy engine cycle completed cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("Economy engine critical error:", error);
    process.exit(1);
  }
})();
