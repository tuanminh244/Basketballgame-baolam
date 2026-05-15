export const normalizeLevelThresholds = (
  rawThresholds: Record<string, number>
): number[] => {
  if (!rawThresholds) return [0];
  const normalized = [0];
  const sortedLevels = Object.keys(rawThresholds)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const level of sortedLevels) {
    normalized[level - 1] = rawThresholds[String(level)];
  }
  
  // Fill any potential gaps with the previous level's XP to ensure monotonic stability
  for (let i = 1; i < normalized.length; i++) {
    if (normalized[i] === undefined || isNaN(normalized[i])) {
      normalized[i] = normalized[i - 1] || 0;
    }
  }
  
  return normalized;
};

export const calculateLevel = (totalXp: number, rawThresholds: Record<string, number>): number => {
  const thresholds = normalizeLevelThresholds(rawThresholds);
  let level = 1;
  
  for (let i = 0; i < thresholds.length; i++) {
    if (totalXp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  return level;
};

export const getNextLevelXpRequired = (currentLevel: number, rawThresholds: Record<string, number>): number | null => {
  const thresholds = normalizeLevelThresholds(rawThresholds);
  if (currentLevel >= thresholds.length) {
    return null; // Reached max configured level
  }
  return thresholds[currentLevel];
};

export const getCurrentLevelBaseXp = (currentLevel: number, rawThresholds: Record<string, number>): number => {
  const thresholds = normalizeLevelThresholds(rawThresholds);
  if (currentLevel <= 1) return 0;
  return thresholds[currentLevel - 1] || 0;
};

export const calculateLevelProgressPercentage = (totalXp: number, currentLevelBaseXp: number, nextLevelXpRequired: number | null): number => {
  if (nextLevelXpRequired === null || nextLevelXpRequired <= currentLevelBaseXp) {
    return 100; // Max level reached
  }
  
  const xpIntoCurrentLevel = Math.max(0, totalXp - currentLevelBaseXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelXpRequired - currentLevelBaseXp);
  
  const progress = (xpIntoCurrentLevel / xpNeededForNextLevel) * 100;
  return Math.min(100, Math.max(0, Math.floor(progress)));
};
