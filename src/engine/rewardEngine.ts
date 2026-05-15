export const calculateCompletionRate = (
  approvedCount: number,
  totalCount: number
): number => {
  if (totalCount <= 0) return 0;
  return Math.min(
    100,
    Math.max(
      0,
      Math.floor((approvedCount / totalCount) * 100)
    )
  );
};

export const checkRewardEligibility = (completionRate: number, threshold: number): boolean => {
  return completionRate >= threshold;
};

export const calculateRemainingTasksForReward = (currentApproved: number, totalTasks: number, targetPercentage: number): number => {
  if (totalTasks <= 0) return 0;
  const targetCount = Math.ceil((targetPercentage / 100) * totalTasks);
  return Math.max(0, targetCount - currentApproved);
};
