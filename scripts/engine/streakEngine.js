/**
 * Chuỗi nhiệm vụ - Streak Timing Semantics
 */
function calculateNextStreak(currentStreak, yesterdayCompletionRate) {
  // Cờ kích hoạt Streak chuẩn: 78% (Hôm qua), Không có grace period
  if (yesterdayCompletionRate >= 78) {
    return currentStreak + 1;
  }
  return 1; 
}

module.exports = { calculateNextStreak };
