export const calculateNewBalance = (currentBalance: number, amount: number): number => {
  return Math.max(0, currentBalance + amount);
};

export const canAfford = (currentBalance: number, cost: number): boolean => {
  return currentBalance >= cost;
};

export const calculateTransactionPreview = (currentBalance: number, cost: number): { affordable: boolean, remainingBalance: number } => {
  const affordable = canAfford(currentBalance, cost);
  const remainingBalance = affordable ? currentBalance - cost : currentBalance;
  return { affordable, remainingBalance };
};

export const calculatePenalty = (
  currentBalance: number, 
  penaltyAmount: number, 
  dailyPenaltyAccumulated: number, 
  maxDailyPenalty: number = 50
): { deduction: number, newBalance: number, newDailyAccumulated: number } => {
  
  if (dailyPenaltyAccumulated >= maxDailyPenalty) {
    return { 
      deduction: 0, 
      newBalance: currentBalance, 
      newDailyAccumulated: dailyPenaltyAccumulated 
    };
  }

  const allowedDeduction = Math.min(penaltyAmount, maxDailyPenalty - dailyPenaltyAccumulated);
  const actualDeduction = Math.min(allowedDeduction, currentBalance);
  
  return {
    deduction: actualDeduction,
    newBalance: currentBalance - actualDeduction,
    newDailyAccumulated: dailyPenaltyAccumulated + actualDeduction
  };
};
