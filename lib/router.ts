import {Pages, PageKey} from 'lib/constants'

/**
 * Replace query params with the props given. Attach extra params to the end.
 * Ex:
 * toHref('analysis', {regionId: 123, projectId: 456}) // => /regions/123/analysis?projectId=456
 */
export function pageToHref(
  key: PageKey,
  props: Record<string, string>
): string {
  const result = routeTo(key, props)
  return result.as
}

export function routeTo(key: PageKey, props: Record<string, string>) {
  const page = Pages[key]
  if (!page) {
    console.error(`${key} is not a valid page!`)
    return {}
  }
  const {query, as} = replaceProps(page, props)
  return {as, href: page, query}
}

function replaceProps(str: string, obj: Record<string, string>) {
  if (!obj) return {as: str}
  const query = {}
  Object.keys(obj).forEach((k) => {
    const key = `[${k}]`
    if (str.includes(key)) {
      str = str.replace(`[${k}]`, obj[k])
    } else {
      query[k] = obj[k]
    }
  })
  const qsKeys = Object.keys(query)
  if (qsKeys.length > 0) {
    str += '?' + qsKeys.map((k) => `${k}=${query[k]}`).join('&')
  }
  return {query, as: str}
}
