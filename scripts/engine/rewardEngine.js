/**
 * Snapshot-based Ledger Reconciliation (Chống Race Conditions)
 * Tuân thủ ECONOMY_LOCK: Dùng xp_granted làm mỏ neo.
 */
function aggregateRewards(tasks, summary) {
  let totalApprovedXp = 0;
  let totalApprovedPoints = 0;

  if (tasks) {
    for (const taskId of Object.keys(tasks)) {
      const task = tasks[taskId];
      if (task.status === 'approved') {
        totalApprovedXp += (task.xp_earned || 0);
        totalApprovedPoints += (task.point_earned || 0);
      }
    }
  }

  const previousGrantedXp = summary?.xp_granted || 0;
  const previousGrantedPoints = summary?.points_granted || 0;

  // Tính Delta dựa trên sự chênh lệch (Monotonic Ledger)
  const deltaXp = Math.max(0, totalApprovedXp - previousGrantedXp);
  const deltaPoints = Math.max(0, totalApprovedPoints - previousGrantedPoints);

  return { totalApprovedXp, totalApprovedPoints, deltaXp, deltaPoints };
}

module.exports = { aggregateRewards };
