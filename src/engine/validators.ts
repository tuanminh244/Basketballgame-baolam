export const isValidTaskStatus = (status: string): boolean => {
  return ['todo', 'pending', 'approved', 'rejected'].includes(status);
};

export const isValidXpAmount = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
};

export const isValidPointAmount = (amount: number): boolean => {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
};

export const canRoleApprove = (role: string): boolean => {
  return role === 'checker' || role === 'admin';
};

export const isNumeric = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value);
};
