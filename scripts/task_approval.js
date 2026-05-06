/**

- scripts/task_approval.js
- FUNCTION B — CRON-BASED ECONOMY ENGINE
- Architecture: Cumulative Ledger (Delta-based)
- Execution: Cron-job every 5 minutes (via GitHub Actions)
  */

const admin = require(“firebase-admin”);

// Initialize Firebase Admin SDK
try {
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: process.env.DATABASE_URL,
});
} catch (error) {
console.error(“🔥 [FATAL] Failed to initialize Firebase Admin SDK. Check Environment Variables.”, error.message);
process.exit(1);
}

const db = admin.database();

/**

- Helper: Lấy thông tin thời gian theo múi giờ VN (Asia/Ho_Chi_Minh)
- @param {number} offsetDays - Số ngày cộng/trừ so với hiện tại
- @returns {Object} { dateStr: “YYYY-MM-DD”, monthNode: “daily_logs_YYYY_MM” }
  */
  function getVNTimeInfo(offsetDays = 0) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnTime = new Date(utc + 7 * 60 * 60 * 1000 + offsetDays * 86400000);

const yyyy = vnTime.getFullYear();
const mm = String(vnTime.getMonth() + 1).padStart(2, “0”);
const dd = String(vnTime.getDate()).padStart(2, “0”);

return {
dateStr: `${yyyy}-${mm}-${dd}`,
monthNode: `daily_logs_${yyyy}_${mm}`,
};
}

async function runEconomyEngine() {
console.log(`\n🚀 [START] Economy Engine Triggered (Cron 5-min)`);

try {
// 1. Lấy danh sách users (Chỉ xử lý role “player”)
const usersSnap = await db.ref(“users”).once(“value”);
const allUsers = usersSnap.val() || {};
const players = Object.keys(allUsers).filter((uid) => allUsers[uid].role === “player”);

```
if (players.length === 0) {
  console.log("⚠️ Không có user nào thuộc role 'player'. Exiting...");
  process.exit(0);
}

// 2. Lấy cấu hình System Config (Level thresholds)
const configSnap = await db.ref("system_config/level_thresholds").once("value");
const levelThresholds = configSnap.val() || {};

// 3. Quét TODAY và YESTERDAY để hỗ trợ Retroactive Approval
const processOffsets = [-1, 0]; // -1: Yesterday, 0: Today

for (const offset of processOffsets) {
  const targetDay = getVNTimeInfo(offset);
  console.log(`\n📅 Processing Date: ${targetDay.dateStr} (${offset === 0 ? "TODAY" : "YESTERDAY"})`);

  for (const uid of players) {
    try {
      const basePath = `${targetDay.monthNode}/${targetDay.dateStr}/${uid}`;
      const dailyLogSnap = await db.ref(basePath).once("value");
      const dailyLog = dailyLogSnap.val();

      if (!dailyLog || !dailyLog.tasks) continue;

      // 4. Tính toán tổng tuyệt đối (Aggregate current approved rewards)
      let totalTasks = 0;
      let approvedTasks = 0;
      let totalApprovedXp = 0;
      let totalApprovedPoints = 0;

      // Safe iteration: Ngăn ngừa lặp qua prototype chain object
      for (const taskId of Object.keys(dailyLog.tasks)) {
        totalTasks++;
        const task = dailyLog.tasks[taskId];
        if (task.status === "approved") {
          approvedTasks++;
          totalApprovedXp += task.xp_earned || 0;
          totalApprovedPoints += task.point_earned || 0;
        }
      }

      if (totalTasks === 0) continue;

      // Tính completion_rate (0 -> 100 integer)
      const completionRate = Math.floor((approvedTasks / totalTasks) * 100);

      /**
       * PRODUCTION NOTE: CLOSURE-VARIABLE TRANSACTION PATTERN
       * Firebase RTDB transactions trong Node.js (Admin SDK) sẽ retry tuần tự (sequential)
       * khi gặp concurrent writes. Pattern khai báo biến closure bên ngoài và gán tuyệt đối
       * (=) bên trong callback là AN TOÀN TUYỆT ĐỐI. Giá trị closure cuối cùng luôn là
       * state của lần thử commit thành công cuối cùng, không bị cộng dồn như (+=).
       */
      let appliedDeltaXp = 0;
      let appliedDeltaPoints = 0;
      let triggered78 = false;
      let triggered100 = false;

      // 5. TRANSACTION 1: CUMULATIVE LEDGER (SUMMARY)
      const summaryRef = db.ref(`${basePath}/summary`);
      const summaryTxResult = await summaryRef.transaction((currentSummary) => {
        let summary = currentSummary || {
          completion_rate: 0,
          status: "ongoing",
          reward_78_unlocked: false,
          reward_100_unlocked: false,
          xp_granted: 0,
          points_granted: 0,
        };

        /**
         * PRODUCTION NOTE: MONOTONIC & IDEMPOTENT PROTECTION
         * - Monotonic: Math.max(0, delta) đảm bảo delta không bao giờ âm, không có rollback,
         *   ngăn ngừa hỏng economy state (deflation).
         * - Idempotent: Tính delta dựa trên tổng Absolute (totalApproved) - Granted.
         *   Nếu cron chạy trùng (replay), delta sẽ tự động = 0 và transaction abort.
         */
        const dXp = Math.max(0, totalApprovedXp - (summary.xp_granted || 0));
        const dPoints = Math.max(0, totalApprovedPoints - (summary.points_granted || 0));

        // Evaluate Gateways
        const u78 = !summary.reward_78_unlocked && completionRate >= 78;
        const u100 = !summary.reward_100_unlocked && completionRate === 100;

        // Abort transaction nếu không có gì để update
        if (dXp === 0 && dPoints === 0 && !u78 && !u100 && summary.completion_rate === completionRate) {
          return;
        }

        // Update Ledger
        summary.completion_rate = completionRate;
        if (dXp > 0) summary.xp_granted = totalApprovedXp;
        if (dPoints > 0) summary.points_granted = totalApprovedPoints;

        if (u78) summary.reward_78_unlocked = true;
        if (u100) summary.reward_100_unlocked = true;

        // Gateway Status Update
        if (completionRate === 100) {
          summary.status = "completed";
        } else if (completionRate >= 78) {
          summary.status = "partial";
        } else {
          summary.status = "ongoing";
        }

        // Gán mutations vào closure variables (Sequential overwrite, no accumulative errors)
        appliedDeltaXp = dXp;
        appliedDeltaPoints = dPoints;
        triggered78 = u78;
        triggered100 = u100;

        return summary;
      });

      // Skip update user stats nếu transaction summary bị abort hoặc không cấp phát delta
      if (!summaryTxResult.committed || (appliedDeltaXp === 0 && appliedDeltaPoints === 0 && !triggered78 && !triggered100)) {
        continue;
      }

      console.log(`   🔹 User [${uid}] - Delta: +${appliedDeltaXp} XP, +${appliedDeltaPoints} Pts | CompRate: ${completionRate}%`);

      // 6. STREAK DATA PREPARATION
      let yesterdayCompRate = 0;
      if (triggered78) {
        const targetYesterday = getVNTimeInfo(offset - 1);
        const ydaySummarySnap = await db.ref(`${targetYesterday.monthNode}/${targetYesterday.dateStr}/${uid}/summary/completion_rate`).once("value");
        yesterdayCompRate = ydaySummarySnap.val() || 0; // First Day Null Safe
      }

      // State capture variables cho việc logging bên ngoài TRANSACTION 2
      let finalStreak = 0;
      let didLevelUp = false;
      let oldLevel = 0;
      let finalLevel = 0;

      // 7. TRANSACTION 2: GRANT REWARDS & UPDATE USER STATS
      const statsRef = db.ref(`users/${uid}/stats`);
      const statsTxResult = await statsRef.transaction((stats) => {
        if (!stats) return stats;

        // Apply Deltas
        stats.current_xp = (stats.current_xp || 0) + appliedDeltaXp;
        stats.total_points = (stats.total_points || 0) + appliedDeltaPoints;

        // Apply Streak Logic (Triggered chỉ khi 78% false -> true)
        if (triggered78) {
          if (yesterdayCompRate >= 78) {
            stats.current_streak = (stats.current_streak || 0) + 1;
          } else {
            stats.current_streak = 1;
          }

          // Streak Bonus Rules
          if (stats.current_streak === 7) stats.total_points += 50;
          if (stats.current_streak === 30) stats.total_points += 300;

          finalStreak = stats.current_streak; // Capture state
        }

        // Level System Logic (Threshold Config-based)
        const prevLevel = stats.level || 1;
        let newLevel = prevLevel;

        for (const lvlStr of Object.keys(levelThresholds)) {
          const reqXp = levelThresholds[lvlStr];
          if (stats.current_xp >= reqXp) {
            newLevel = Math.max(newLevel, parseInt(lvlStr));
          }
        }

        if (newLevel > prevLevel) {
          didLevelUp = true;
          oldLevel = prevLevel;
          finalLevel = newLevel;
        }

        stats.level = newLevel;

        return stats;
      });

      // 8. LOGGING (An toàn sau khi transaction commit thành công)
      if (statsTxResult.committed) {
        if (triggered78) {
          console.log(`      🏆 Gateway 78% Unlocked! Streak updated to: ${finalStreak}`);
        }
        if (triggered100) {
          console.log(`      🌟 Gateway 100% Unlocked!`);
        }
        if (didLevelUp) {
          console.log(`      🆙 LEVEL UP! Level ${oldLevel} -> ${finalLevel}`);
        }
      }

    } catch (userError) {
      // Fail Safe: Lỗi 1 user -> log error, skip, tiếp tục batch
      console.error(`❌ [ERROR] Failed processing user ${uid} on ${targetDay.dateStr}:`, userError.message);
    }
  }
}

console.log(`\n✅ [SUCCESS] Economy Engine Completed.`);
process.exit(0);
```

} catch (error) {
console.error(“🔥 [FATAL] Engine crashed during execution:”, error);
process.exit(1);
}
}

// Thực thi
runEconomyEngine();