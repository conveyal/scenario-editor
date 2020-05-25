// Set a limit for logging errors so that we can log high usage functions that
// would usually slow the application down from too much I/O
export default function createLogError(maxLimit = 50, delayMs = 1) {
  return function logError(...args) {
    if (maxLimit !== 0) {
      maxLimit -= 1
      setTimeout(() => console.error(...args), delayMs)
    }
  }
}
