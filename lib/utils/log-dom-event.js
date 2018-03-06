// @flow
import debug from 'debug'

const debugEvent = debug('analysis-ui:dom-event')

export default function createLogEvent (filename: string) {
  return function logEvent (functionName: string, evt: any) {
    debugEvent(`${filename}.${functionName}`, evt)
  }
}
