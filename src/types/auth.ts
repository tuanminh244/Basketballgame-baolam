export interface BaseEntity {
  readonly id: string;
  readonly created_at: number;
  readonly updated_at: number;
}

export type UserRole = 'admin' | 'checker' | 'player';

export interface PlayerStats {
  readonly level: number;
  readonly current_xp: number;
  readonly total_points: number;
  readonly current_streak: number;
  readonly daily_penalty_accumulated: number;
}

export interface BaseUser {
  readonly name: string;
  readonly role: UserRole;
  readonly pass_pin: string;
}

export interface PlayerUser extends BaseUser {
  readonly role: 'player';
  readonly stats: PlayerStats;
}

export interface ParentUser extends BaseUser {
  readonly role: 'admin' | 'checker';
}

export interface SessionUser {
  readonly id: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface AuthState {
  readonly user: SessionUser | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface LoginPayload {
  readonly pin: string;
}
