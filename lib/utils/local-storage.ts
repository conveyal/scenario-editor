// For testing and old browsers
const localStorage =
  process.env.NODE_ENV !== 'test' &&
  typeof window !== 'undefined' &&
  window.localStorage
    ? window.localStorage
    : {
        getItem() {
          return ''
        },
        setItem() {},
        removeItem() {}
      }

export function getParsedItem(key: string): Record<string, unknown> {
  try {
    const str = localStorage.getItem(key)
    return JSON.parse(str)
  } catch (e) {
    return
  }
}

export function stringifyAndSet(key, item) {
  localStorage.setItem(key, JSON.stringify(item))
}

export default localStorage
