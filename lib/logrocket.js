import LogRocket from 'logrocket'

import createLogError from 'lib/utils/log-error'

// Just log it once
const logError = createLogError(1)

// Is using LogRocket
const isEnabled =
  process.browser && process.env.LOGROCKET && process.env.LOGROCKET !== 'false'

// Init
if (isEnabled) LogRocket.init(process.env.LOGROCKET)

export default {
  identify(...args) {
    if (isEnabled) LogRocket.identify(...args)
    else logError('LogRocket not enabled', ...args)
  },
  captureException(...args) {
    if (isEnabled) LogRocket.captureException(...args)
    else console.error(...args) // do not rate limit this
  }
}
