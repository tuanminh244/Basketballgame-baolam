// Centralized app constants
// STRICT RULE: NO business logic. Constants only.

export const ROLES = {
  ADMIN: 'admin',     // Bố
  CHECKER: 'checker', // Mẹ
  PLAYER: 'player',   // Bảo Lâm, Bảo Linh
} as const;

export const APPROVAL_STATUS = {
  TODO: 'todo',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const REWARD_TYPES = {
  XP: 'xp',
  POINTS: 'points',
} as const;

export const ECONOMY = {
  MAX_DAILY_TASKS: 10,
  MAX_DAILY_PENALTY: 50,
  REWARD_THRESHOLD_TIER_1: 78,
  REWARD_THRESHOLD_TIER_2: 100,
} as const;

export const LOCAL_STORAGE_KEYS = {
  USER_SESSION: 'coregame_user_session',
  AUTH_PIN: 'coregame_auth_pin',
  THEME_PREFERENCE: 'coregame_theme_pref',
} as const;