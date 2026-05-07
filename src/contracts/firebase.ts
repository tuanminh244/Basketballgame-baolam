export interface UserStats {
  level: number;
  xp: number;
  coins: number;
}

export interface Task {
  id: string;
  title: string;
  difficulty: number;
  completed: boolean;
}

export interface ApprovalTask {
  taskId: string;
  uid: string;
  status: "pending" | "approved" | "rejected";
}