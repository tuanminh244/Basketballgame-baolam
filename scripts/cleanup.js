const { adminDb } = require('./shared/firebaseAdmin');
const logger = require('./shared/logger');

async function runCleanup() {
  const executionId = Date.now();
  logger.info(`[${executionId}] Starting Maintenance Cleanup...`);

  try {
    // Lấy danh sách UID thay vì query toàn bộ root node 'transactions'
    const usersIndexSnap = await adminDb.ref('user_index').get();
    
    if (!usersIndexSnap.exists()) {
       logger.info(`[${executionId}] No users found in user_index. Nothing to cleanup.`);
       return;
    }

    const uids = Object.keys(usersIndexSnap.val());
    const now = Date.now();
    let cleanedCount = 0;

    // Scan an toàn theo path transactions/{uid} thay vì load cục bộ
    for (const uid of uids) {
      try {
         const txRef = adminDb.ref(`transactions/${uid}`);
         const txSnap = await txRef.get();

         if (txSnap.exists()) {
            const updates = {};
            
            txSnap.forEach(tx => {
               const txData = tx.val();
               // Hủy giao dịch nếu bị kẹt pending quá 10 phút
               if (txData.status === 'pending_delivery' && (now - txData.created_at > 10 * 60 * 1000)) { 
                   updates[`transactions/${uid}/${tx.key}/status`] = 'cancelled';
               }
            });

            if (Object.keys(updates).length > 0) {
               await adminDb.ref().update(updates);
               cleanedCount += Object.keys(updates).length;
            }
         }
      } catch (userErr) {
         logger.error(`[${executionId}] Cleanup error for user ${uid}: ${userErr.message}`);
         // Lỗi ở 1 user không làm sụp đổ tiến trình dọn dẹp của user khác
      }
    }

    logger.success(`[${executionId}] Maintenance Cleanup completed. Cleaned up ${cleanedCount} stale transactions.`);
  } catch (error) {
    logger.error(`[${executionId}] Cleanup encountered a critical error:`, error);
  }
}

if (require.main === module) {
  runCleanup();
}

module.exports = runCleanup;
