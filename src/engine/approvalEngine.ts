export const canApprove = (role: string, currentStatus: string): boolean => {
  const isAuthorizedRole = role === 'checker' || role === 'admin';
  return isAuthorizedRole && currentStatus === 'pending';
};

export const canReject = (role: string, currentStatus: string): boolean => {
  const isAuthorizedRole = role === 'checker' || role === 'admin';
  return isAuthorizedRole && currentStatus === 'pending';
};

export const canSubmitProof = (role: string, currentStatus: string): boolean => {
  const isAuthorizedRole = role === 'player' || role === 'admin';
  return isAuthorizedRole && currentStatus === 'todo';
};

export const isTaskLocked = (currentStatus: string): boolean => {
  return currentStatus === 'approved' || currentStatus === 'rejected';
};
