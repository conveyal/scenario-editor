// Do the arrays intersect?
export default function arraysIntersect<T>(a1: T[], a2: T[]) {
  for (const v of a1) {
    if (a2.indexOf(v) > -1) return true
  }
  return false
}
