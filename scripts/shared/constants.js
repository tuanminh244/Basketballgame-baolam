module.exports = {
  APPROVAL_STATUSES: {
    TODO: 'todo',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  REWARD_TYPES: {
    XP: 'xp',
    POINTS: 'points'
  },
  ECONOMY_LIMITS: {
    MAX_DAILY_PENALTY: 50,
    MIN_BALANCE: 0
  },
  BATCH_SIZES: {
    MAX_TASKS_PER_DAY: 10,
    PROCESS_BATCH_LIMIT: 100
  },
  CLEANUP_THRESHOLDS: {
    RETENTION_DAYS: 30
  }
};
