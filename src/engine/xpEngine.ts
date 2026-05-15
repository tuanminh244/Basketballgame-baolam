export const calculateXpGain = (baseXp: number, completionMultiplier: number = 1.0): number => {
  return Math.floor(Math.max(0, baseXp) * completionMultiplier);
};

export const calculateTotalXp = (currentXp: number, earnedXp: number): number => {
  // XP is perfectly monotonic. It never decreases.
  return Math.max(0, currentXp) + Math.max(0, earnedXp);
};

export const calculateXpPreview = (currentXp: number, potentialXp: number): number => {
  return calculateTotalXp(currentXp, potentialXp);
};
