const admin = require("firebase-admin");

try {
  // Đọc chứng chỉ thẳng từ biến môi trường
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
  });

  const db = admin.database();

  (async () => {
    try {
      // 1. CHUẨN HÓA THỜI GIAN (UTC+7)
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnTime = new Date(utc + 7 * 60 * 60 * 1000);
      
      // Ngày hôm nay
      const yyyy = vnTime.getFullYear();
      const mm = String(vnTime.getMonth() + 1).padStart(2, "0");
      const dd = String(vnTime.getDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      const yyyy_mm = `${yyyy}_${mm}`;
      const dailyNode = `daily_logs_${yyyy_mm}`;

      console.log(`🚀 Bắt đầu Daily Reset cho ngày: ${date} (Timezone: Asia/Ho_Chi_Minh)`);

      const updates = {};

      // 2. FETCH TOÀN BỘ DATA (Tối ưu API calls thành 1 block)
      const [
        usersSnap,
        taskBatchSnap,
        taskTemplatesSnap,
        todayLogsSnap,
        configSnap
      ] = await Promise.all([
        db.ref("users").once("value"),
        db.ref("task_batches").once("value"),
        db.ref("task_templates").once("value"),
        db.ref(`${dailyNode}/${date}`).once("value"),
        db.ref("system_config/current_month_node").once("value")
      ]);

      const users = usersSnap.val() || {};
      const taskBatches = taskBatchSnap.val() || {};
      const taskTemplates = taskTemplatesSnap.val() || {};
      const todayLogs = todayLogsSnap.val() || {};
      const currentMonthNode = configSnap.val();

      // 3. XỬ LÝ PENALTY (CHỈ DÀNH CHO PLAYER)
      Object.entries(users).forEach(([uid, user]) => {
        if (user.role === "player") {
          updates[`users/${uid}/stats/daily_penalty_accumulated`] = 0;
        } else {
          console.log(`⏭️  Skip user ${uid}: Không phải player (Role: ${user.role || 'unknown'})`);
        }
      });

      // 4. CLONE TASKS TỪ BATCH VÀO DAILY LOGS (CÓ IDEMPOTENCY GUARD)
      for (const [batchId, batch] of Object.entries(taskBatches)) {
        if (batch.status !== "active") continue;
        
        const userId = batch.owner_id; 
        if (!userId || !batch.tasks) continue;

        // Bổ sung an toàn: Bỏ qua nếu user của batch không tồn tại hoặc không phải player
        if (!users[userId] || users[userId].role !== "player") continue;

        // IDEMPOTENCY: Bỏ qua nếu dữ liệu của ngày hôm nay đã tồn tại
        if (todayLogs[userId] && todayLogs[userId].summary) {
          console.log(`⏭️  Skip tạo task cho user ${userId}: Data ngày ${date} đã tồn tại (Idempotency).`);
          continue;
        }

        const basePath = `${dailyNode}/${date}/${userId}`;
        const clonedTasks = {};

        Object.values(batch.tasks).forEach((taskId) => {
          const tmpl = taskTemplates[taskId];
          if (!tmpl) return;
          
          clonedTasks[taskId] = {
            status: "todo",
            xp_earned: tmpl.xp_reward || 0,
            point_earned: tmpl.point_reward || 0,
            updated_at: Date.now(),
          };
        });

        // 👉 GUARD: Bỏ qua hoàn toàn nếu không có task nào hợp lệ
        if (Object.keys(clonedTasks).length === 0) {
          console.warn(`⚠️ Batch ${batchId}: Không có task template hợp lệ — skip.`);
          continue;
        }

        updates[`${basePath}/tasks`] = clonedTasks;
        
        updates[`${basePath}/summary`] = {
          completion_rate: 0,
          status: "incomplete", 
          reward_78_unlocked: false,
          reward_100_unlocked: false,
        };
        
        console.log(`✅ Đã clone task log mới cho user ${userId} ngày ${date}`);
      }

      // 5. CẬP NHẬT SYSTEM CONFIG NẾU QUA THÁNG MỚI
      if (currentMonthNode !== dailyNode) {
        updates["system_config/current_month_node"] = dailyNode;
        console.log(`🔄 Chuyển tháng mới → Đã cập nhật node hệ thống thành: ${dailyNode}`);
      }

      // 6. THỰC THI ATOMIC UPDATE
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log("✅ Daily Reset Engine chạy thành công!");
      } else {
        console.log("ℹ️ Không có update nào cần thực thi.");
      }
      
      process.exit(0);
      
    } catch (error) {
      console.error("❌ Lỗi nghiêm trọng trong quá trình chạy Daily Reset:", error);
      process.exit(1);
    }
  })();
} catch (initError) {
  console.error("❌ Lỗi khởi tạo Firebase Admin SDK (Kiểm tra lại Secrets):", initError);
  process.exit(1);
}
