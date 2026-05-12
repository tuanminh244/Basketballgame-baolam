// src/hooks/useCurrentVNDate.ts
import { useState, useEffect } from 'react';
import { getVNDateParts, VNDateParts } from '@/utils/time';

export function useCurrentVNDate(): VNDateParts {
  const [dateParts, setDateParts] = useState<VNDateParts>(getVNDateParts());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextUpdate = () => {
      const now = new Date();
      const vnTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
      const vnTime = new Date(vnTimeString);

      const tomorrowVn = new Date(vnTime.getTime());
      tomorrowVn.setDate(tomorrowVn.getDate() + 1);
      tomorrowVn.setHours(0, 0, 0, 0);

      const msUntilMidnight = tomorrowVn.getTime() - vnTime.getTime();

      timeoutId = setTimeout(() => {
        setDateParts(getVNDateParts());
        scheduleNextUpdate();
      }, msUntilMidnight + 1000);
    };

    scheduleNextUpdate();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return dateParts;
}
