export interface VNDateParts {
  yyyy: string;
  mm: string;
  dd: string;
  yyyy_mm: string;
  date: string;
}

export function getVNDateParts(): VNDateParts {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(now);
  let year = '';
  let month = '';
  let day = '';

  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
  }

  return {
    yyyy: year,
    mm: month,
    dd: day,
    yyyy_mm: `${year}_${month}`,
    date: `${year}-${month}-${day}`
  };
}

export function getVietnamDate(): string {
  return getVNDateParts().date;
}

/**
 * ⚠️ ARCHITECTURE SAFETY WARNING - BACKEND ONLY ⚠️
 * * DO NOT USE THIS FUNCTION IN FRONTEND / HOOKS / COMPONENTS.
 * * Frontend layer MUST read the authoritative month node from Firebase:
 * `system_config/current_month_node`
 * * Reason: Using client-side calculated month nodes causes severe month-boundary 
 * desync issues (race conditions) at 00:00 rollover when the daily_reset cron 
 * hasn't finished updating the backend state.
 * * This function is STRICTLY reserved for scripts/, cron jobs, and backend automation.
 */
export function buildDailyLogsNode(): string {
  return `daily_logs_${getVNDateParts().yyyy_mm}`;
}
