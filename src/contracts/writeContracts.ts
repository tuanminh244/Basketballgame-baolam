export interface SubmitTaskContract {
  status: 'pending';
  updated_at: number;
}

export interface ApproveTaskContract {
  status: 'approved';
  updated_at: number;
  verified_by: string;
}

export interface RejectTaskContract {
  status: 'rejected';
  updated_at: number;
  verified_by: string;
}
