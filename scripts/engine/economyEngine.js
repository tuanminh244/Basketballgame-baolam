const { ECONOMY_LIMITS } = require('../shared/constants');

/**
 * PURE FUNCTION: Tính toán số dư ví an toàn (Không bao giờ âm)
 */
function calculateSafeBalance(currentPoints, deltaPoints) {
  const newPoints = currentPoints + deltaPoints;
  return Math.max(ECONOMY_LIMITS.MIN_BALANCE, newPoints);
}

/**
 * IMPORTANT: Caller MUST ALSO update users/{uid}/stats/daily_penalty_accumulated.
 * This function ONLY calculates the safe deduction amount.
 */
function calculatePenalty(deductionAmount, currentDailyPenalty) {
  if (currentDailyPenalty >= ECONOMY_LIMITS.MAX_DAILY_PENALTY) {
    return 0; // Đã chạm trần phạt ngày
  }
  return Math.min(deductionAmount, ECONOMY_LIMITS.MAX_DAILY_PENALTY - currentDailyPenalty);
}

module.exports = { calculateSafeBalance, calculatePenalty };
