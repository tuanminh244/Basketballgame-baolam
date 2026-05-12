const { adminDb } = require('./shared/firebaseAdmin');
const logger = require('./shared/logger');

async function runCleanup() {
  logger.info('Starting Maintenance Cleanup...');

  try {
    const txRef = adminDb.ref('transactions');
    const txSnap = await txRef.get();
    
    if (txSnap.exists()) {
       const now = Date.now();
       const updates = {};

       // Duyệt qua UserId trước do cấu trúc đúng là transactions/{userId}/{txId}
       txSnap.forEach(userTxSnap => {
          const userId = userTxSnap.key;
          
          userTxSnap.forEach(tx => {
             const txData = tx.val();
             // Hủy giao dịch nếu bị kẹt pending quá 10 phút
             if (txData.status === 'pending_delivery' && (now - txData.created_at > 10 * 60 * 1000)) { 
                 updates[`transactions/${userId}/${tx.key}/status`] = 'cancelled';
             }
          });
       });
       
       if (Object.keys(updates).length > 0) {
          await adminDb.ref().update(updates);
          logger.info(`Cleaned up ${Object.keys(updates).length} stale transactions.`);
       }
    }

    logger.success('Maintenance Cleanup completed.');
  } catch (error) {
    logger.error('Cleanup encountered an error:', error);
  }
}

if (require.main === module) {
  runCleanup();
}

module.exports = runCleanup;
