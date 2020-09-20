import LogRocket from 'lib/logrocket'

const FETCH_ERROR = 'FETCH_ERROR'
const NONE = 'NONE'
const CLIENT_ERROR = 'CLIENT_ERROR'
const SERVER_ERROR = 'SERVER_ERROR'
// const TIMEOUT_ERROR = 'TIMEOUT_ERROR'
// const CONNECTION_ERROR = 'CONNECTION_ERROR'
// const NETWORK_ERROR = 'NETWORK_ERROR'
// const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

// const TIMEOUT_ERROR_CODES = ['ECONNABORTED']
// const NODEJS_CONNECTION_ERROR_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET']

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8'
}

function getProblemFromResponse(res: Response) {
  if (res.ok) {
    return {
      ok: true,
      problem: NONE
    }
  }
  if (res.status >= 500) {
    return {
      ok: false,
      problem: SERVER_ERROR
    }
  }
  if (res.status >= 400 && res.status <= 499) {
    return {
      ok: false,
      problem: CLIENT_ERROR
    }
  }
}

function getProblemFromError(e: Error): string {
  console.error(e)
  return FETCH_ERROR
}

async function getData(res: Response) {
  const type = res.headers.get('Content-Type') || ''
  if (type.indexOf('json') > -1) return res.json()
  if (type.indexOf('text') > -1) return {message: await res.text()}
  if (type.indexOf('octet-stream') > -1) return res.arrayBuffer()
  return {message: 'no content'}
}

async function safeParseResponse(res: Response) {
  const data = await getData(res)
  const problem = getProblemFromResponse(res)
  return {...res, ...problem, data}
}

type SafeResponse =
  | {
      ok: false
      data: Error
      problem: string
    }
  | (Response & {
      ok: boolean
      data: any
      problem: string
    })

/**
 * Never throw errors. Always return a response.
 */
export async function safeFetch(url, options = {}): Promise<SafeResponse> {
  try {
    const res = await fetch(url, options)
    return await safeParseResponse(res)
  } catch (e) {
    LogRocket.captureException(e)
    // TODO parse error see: https://github.com/infinitered/apisauce/blob/master/lib/apisauce.ts
    return {
      data: e,
      ok: false,
      problem: getProblemFromError(e)
    }
  }
}

/**
 * Throw the response when using SWR.
 */
export const swrConfig = {
  fetcher: (url) =>
    safeFetch(url).then((res) => {
      if (res.ok) return res.data
      else throw res
    })
}

/**
 * Safe DELETE
 */
export function safeDelete(url) {
  return safeFetch(url, {
    method: 'DELETE'
  })
}

/**
 * Simple GET
 */
export function getJSON(url) {
  return safeFetch(url, {headers: defaultHeaders})
}

/**
 * Simple POST
 */
export function postJSON(url, json) {
  return safeFetch(url, {
    body: JSON.stringify(json),
    headers: defaultHeaders,
    method: 'POST'
  })
}

/**
 * Simple PUT
 */
export function putJSON(url, json) {
  return safeFetch(url, {
    body: JSON.stringify(json),
    headers: defaultHeaders,
    method: 'PUT'
  })
}
