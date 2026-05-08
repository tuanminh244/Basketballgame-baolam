export function getVietnamTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
}

export function getVietnamDate(dateObj?: Date): string {
  const vnTime = dateObj || getVietnamTime();
  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, "0");
  const dd = String(vnTime.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
