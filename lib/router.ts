import {RouteTo} from 'lib/constants'

export function routeTo(to: string, props: any) {
  const href = RouteTo[to]
  if (!href) {
    console.error(`${to} is not a valid RouteTo route!`)
    return {}
  }
  const {query, as} = hrefToAs(href, props)
  return {as, href, query}
}

export function hrefToAs(str: string, obj: any) {
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
