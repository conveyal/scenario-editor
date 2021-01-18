/**
 * Collect debug durations.
 */
export default class Durations {
  current: Record<string, number> = {}
  startTimes: Record<string, number> = {}

  clear() {
    this.current = {}
    this.startTimes = {}
  }

  start(name: string) {
    this.startTimes[name] = Date.now()

    return {
      mark: () => this.mark(name)
    }
  }

  mark(name: string) {
    this.current[name] = Date.now() - this.startTimes[name]
  }
}
