// src/utils/time.ts
export interface VNDateParts {
  yyyy_mm: string;
  date: string;
}

export function getVNDateParts(): VNDateParts {
  const vnTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getDate()).padStart(2, '0');
  
  return {
    yyyy_mm: `${yyyy}_${mm}`,
    date: `${yyyy}-${mm}-${dd}`
  };
}

export function buildDailyLogsNode(yyyy_mm: string): string {
  return `daily_logs_${yyyy_mm}`;
}
