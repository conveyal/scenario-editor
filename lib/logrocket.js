import LogRocket from 'logrocket'

import createLogError from 'lib/utils/log-error'

// Just log it once
const logError = createLogError(1)

export default (function createLogRocket() {
  if (
    process.browser &&
    process.env.NEXT_PUBLIC_LOGROCKET &&
    process.env.NEXT_PUBLIC_LOGROCKET !== 'false'
  ) {
    LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET)
    return LogRocket
  } else {
    return {
      identify(...args) {
        logError('LogRocket not enabled', ...args)
      },
      captureException(...args) {
        console.error(...args) // do not rate limit this
      }
    }
  }
})()
