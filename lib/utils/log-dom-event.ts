export default function createLogEvent(filename: string) {
  return function logEvent(functionName: string, evt: unknown) {
    console.log(`${filename}.${functionName}`, evt)
  }
}
