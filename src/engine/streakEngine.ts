export const calculateNextStreak = (
  currentStreak: number,
  wasYesterdayCompleted: boolean
): number => {
  return wasYesterdayCompleted
    ? currentStreak + 1
    : 1;
};

export const calculateStreakBonus = (
  currentStreak: number,
  bonusThresholds: Record<number, number>
): number => {
  if (!bonusThresholds) {
    return 0;
  }
  return bonusThresholds[currentStreak] ?? 0;
};

export const isStreakMaintained = (lastCompletedDate: string, targetDate: string): boolean => {
  return lastCompletedDate === targetDate;
};
