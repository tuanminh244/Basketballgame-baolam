import { SubmitTaskContract, ApproveTaskContract, RejectTaskContract } from '@/contracts/writeContracts';

// [DEPLOY SAFETY]
// BẮT BUỘC dùng update() với partial field paths.
// TUYỆT ĐỐI KHÔNG dùng set() tại task node để tránh ghi đè làm mất metadata.
export const submitTask = async (taskPath: string): Promise<void> => {
  const payload: SubmitTaskContract = {
    status: 'pending',
    updated_at: Date.now(),
  };
  console.log(`[WRITE SECURE - PARTIAL] Child submit:`, payload);
};

export const approveTask = async (taskPath: string, checkerUid: string): Promise<void> => {
  const payload: ApproveTaskContract = {
    status: 'approved',
    updated_at: Date.now(),
    verified_by: checkerUid,
  };
  console.log(`[WRITE SECURE - PARTIAL] Checker approve:`, payload);
};

export const rejectTask = async (taskPath: string, checkerUid: string): Promise<void> => {
  const payload: RejectTaskContract = {
    status: 'rejected',
    updated_at: Date.now(),
    verified_by: checkerUid,
  };
  console.log(`[WRITE SECURE - PARTIAL] Checker reject:`, payload);
};
