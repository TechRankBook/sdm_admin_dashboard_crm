
// Enhanced logging with timestamps for debugging
export const authLog = (message: string, ...args: any[]) => {
  console.log(`[AuthProvider ${new Date().toISOString()}]: ${message}`, ...args)
}
