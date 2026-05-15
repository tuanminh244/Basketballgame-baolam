export function notifySuccess(message: string): void {
  console.log(`✅ [SUCCESS]: ${message}`);
}

export function notifyError(message: string, error?: unknown): void {
  console.error(`❌ [ERROR]: ${message}`, error || '');
}

export function notifyInfo(message: string): void {
  console.info(`ℹ️ [INFO]: ${message}`);
}
