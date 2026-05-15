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

// Alias to satisfy UI layer contracts
export type UserStats = PlayerStats;

export interface BaseUser {
  readonly name: string;
  readonly role: UserRole;
  readonly pass_pin: string;
}

export interface PlayerUser extends BaseUser {
  readonly role: 'player';
  readonly stats: PlayerStats;
}

export interface CheckerUser extends BaseUser {
  readonly role: 'checker';
}

export interface AdminUser extends BaseUser {
  readonly role: 'admin';
}

export type User = PlayerUser | CheckerUser | AdminUser;

// SessionUser is historically used, aliased to User to prevent duplication
export type SessionUser = User;

// Canonical type with ID attached (returned from auth service)
export type AuthUser = User & { id: string };
