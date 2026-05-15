const { adminDb, terminate } = require('./shared/firebaseAdmin');
const logger = require('./shared/logger');

async function runDailyReset() {
  logger.info('Starting Daily Reset Routine...');

  const now = new Date();

  // Xử lý múi giờ chuẩn Asia/Ho_Chi_Minh (+7 UTC)
  const offset = 7 * 60 * 60 * 1000;
  const localDate = new Date(now.getTime() + offset);

  const yyyy = localDate.getUTCFullYear();
  const mm = String(localDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(localDate.getUTCDate()).padStart(2, '0');

  const dateKey = `${yyyy}-${mm}-${dd}`;
  const monthKey = `${yyyy}_${mm}`;

  try {
    const usersIndexSnap = await adminDb.ref('user_index').get();

    if (!usersIndexSnap.exists()) {
      logger.warn('No users found in user_index');
      return;
    }

    const templatesSnap = await adminDb.ref('task_templates').get();
    const templates = templatesSnap.val() || {};

    const updates = {};

    // Map chính xác Root Node của tháng hiện tại
    updates['system_config/current_month_node'] = `daily_logs_${monthKey}`;

    const uids = Object.keys(usersIndexSnap.val());

    for (const uid of uids) {
      const roleSnap = await adminDb.ref(`users/${uid}/role`).get();

      if (roleSnap.val() === 'player') {
        const basePath = `daily_logs_${monthKey}/${dateKey}/${uid}`;

        // Reset Penalty Cap
        updates[`users/${uid}/stats/daily_penalty_accumulated`] = 0;

        // Khởi tạo Summary
        updates[`${basePath}/summary`] = {
          completion_rate: 0,
          reward_78_unlocked: false,
          reward_100_unlocked: false,
          xp_granted: 0,
          points_granted: 0,
          status: 'ongoing'
        };

        const clonedTasks = {};

        for (const templateId in templates) {
          const tmpl = templates[templateId];

          if (tmpl.owner_id === uid) {
            // Clone an toàn, loại bỏ field ngoài schema
            clonedTasks[templateId] = {
              status: 'todo',
              xp_earned: tmpl.xp_reward || 0,
              point_earned: tmpl.point_reward || 0,
              updated_at: Date.now()
            };
          }
        }

        // Chỉ ghi tasks nếu có task hợp lệ
        if (Object.keys(clonedTasks).length > 0) {
          updates[`${basePath}/tasks`] = clonedTasks;
        }
      }
    }

    await adminDb.ref().update(updates);

    logger.success(`Daily Reset completed for ${dateKey}`);

  } catch (err) {
    logger.error(`Daily Reset Failed: ${err.message}`, err);

    // BẮT BUỘC propagate lỗi
    throw err;
  }
}

if (require.main === module) {

  // Safety timeout chống workflow treo vô hạn
  const forceExit = setTimeout(() => {
    logger.warn('[SAFETY] Force exit triggered after 60s timeout');
    process.exit(0);
  }, 60000);

  forceExit.unref();

  runDailyReset()
    .then(async () => {

      clearTimeout(forceExit);

      if (terminate) {
        await terminate();
      }

      process.exit(0);
    })
    .catch(async (error) => {

      clearTimeout(forceExit);

      logger.error('Daily Reset execution failed:', error);

      if (terminate) {
        await terminate();
      }

      process.exit(1);
    });
}

module.exports = runDailyReset;