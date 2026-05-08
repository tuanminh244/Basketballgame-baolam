const admin = require("firebase-admin");

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  const db = admin.database();

  (async () => {
    try {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnTime = new Date(utc + 7 * 60 * 60 * 1000);
      
      const yyyy = vnTime.getFullYear();
      const mm = String(vnTime.getMonth() + 1).padStart(2, "0");
      const dd = String(vnTime.getDate()).padStart(2, "0");
      const dateToday = `${yyyy}-${mm}-${dd}`;
      const dailyNode = `daily_logs_${yyyy}_${mm}`;
      
      console.log("Running daily reset for:", dateToday);

      const [usersSnap, taskBatchesSnap, taskTemplatesSnap, configSnap] = await Promise.all([
        db.ref("users").once("value"),
        db.ref("task_batches").once("value"),
        db.ref("task_templates").once("value"),
        db.ref("system_config").once("value")
      ]);

      const users = usersSnap.val() || {};
      const taskBatches = taskBatchesSnap.val() || {};
      const taskTemplates = taskTemplatesSnap.val() || {};
      const systemConfig = configSnap.val() || {};

      const updates = {};

      Object.keys(users).forEach((uid) => {
        if (users[uid].role === "player") {
          updates[`users/${uid}/stats/daily_penalty_accumulated`] = 0;
        }
      });

      Object.entries(taskBatches).forEach(([batchId, batch]) => {
        if (batch.status !== "active") return;
        const userId = batch.owner_id;
        if (!userId || !batch.tasks) return;

        const basePath = `${dailyNode}/${dateToday}/${userId}`;
        const clonedTasks = {};

        Object.values(batch.tasks).forEach((taskId) => {
          const tmpl = taskTemplates[taskId];
          if (!tmpl) return;
          clonedTasks[taskId] = {
            status: "todo",
            xp_earned: tmpl.xp_reward,
            point_earned: tmpl.point_reward,
            updated_at: Date.now(),
          };
        });

        if (Object.keys(clonedTasks).length === 0) return;

        updates[`${basePath}/tasks`] = clonedTasks;
        updates[`${basePath}/summary`] = {
          completion_rate: 0,
          status: "incomplete",
          reward_78_unlocked: false,
          reward_100_unlocked: false,
          xp_granted: 0,
          points_granted: 0
        };
      });

      if (systemConfig.current_month_node !== dailyNode) {
        updates["system_config/current_month_node"] = dailyNode;
        console.log("Month changed → updated system_config");
      }

      await db.ref().update(updates);
      console.log("Daily reset completed successfully");
      process.exit(0);
    } catch (error) {
      console.error("Error during daily reset:", error);
      process.exit(1);
    }
  })();
} catch (initError) {
  console.error("Initialization error:", initError);
  process.exit(1);
}
