import LogRocket from 'lib/logrocket'

export type ResponseError = {
  ok: false
  data?: unknown
  error: Error
  problem: string
}

export type ResponseOk<T> = Response & {
  ok: true
  data: T
}

export type SafeResponse<T> = ResponseError | ResponseOk<T>

export const FETCH_ERROR = 'FETCH_ERROR'
export const NONE = 'NONE'
export const CLIENT_ERROR = 'CLIENT_ERROR'
export const SERVER_ERROR = 'SERVER_ERROR'
// const TIMEOUT_ERROR = 'TIMEOUT_ERROR'
// const CONNECTION_ERROR = 'CONNECTION_ERROR'
// const NETWORK_ERROR = 'NETWORK_ERROR'
const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

// const TIMEOUT_ERROR_CODES = ['ECONNABORTED']
// const NODEJS_CONNECTION_ERROR_CODES = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET']

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8'
}

function getProblemFromResponse(res: Response): string {
  if (res.status >= 500) return SERVER_ERROR
  if (res.status >= 400 && res.status <= 499) return CLIENT_ERROR
  return UNKNOWN_ERROR
}

function getProblemFromError(_: Error): string {
  return FETCH_ERROR
}

async function getData(res: Response) {
  const type = res.headers.get('Content-Type') || ''
  if (type.indexOf('json') > -1) return res.json()
  if (type.indexOf('text') > -1) return {message: await res.text()}
  if (type.indexOf('octet-stream') > -1) return res.arrayBuffer()
  return {message: 'no content'}
}

const defaultErrorMessage = 'Error while fetching data.'
async function parseErrorMessageFromResponse(
  response: Response
): Promise<string> {
  try {
    const data = await getData(response)
    return data == null
      ? 'Error while fetching data.'
      : typeof data === 'string'
      ? data
      : typeof data === 'object' &&
        Object.prototype.hasOwnProperty.call(data, 'message')
      ? data.message
      : JSON.stringify(data)
  } catch (e) {
    return defaultErrorMessage
  }
}

const toArrayBuffer = (res: Response) => res.arrayBuffer()
const toText = (res: Response) => res.text()
const toJSON = (res: Response) => res.json()

export const fetchArrayBuffer = (url: string) =>
  safeFetch<ArrayBuffer>(url, toArrayBuffer)
export const fetchText = (url: string) => safeFetch<string>(url, toText)
export function fetchData<T>(url: string, options?: RequestInit) {
  return safeFetch<T>(url, toJSON, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers
    }
  })
}

/**
 * Never throw errors. Always return a response.
 */
export async function safeFetch<T>(
  url: string,
  parseData: (response: Response) => Promise<T>,
  options?: RequestInit
): Promise<SafeResponse<T>> {
  try {
    const res = await fetch(url, options)
    if (res.ok) {
      return {
        ...res,
        data: await parseData(res),
        ok: true
      }
    } else {
      return {
        ...res,
        error: new Error(await parseErrorMessageFromResponse(res)),
        ok: false,
        problem: getProblemFromResponse(res)
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      LogRocket.captureException(e)
      // TODO parse error see: https://github.com/infinitered/apisauce/blob/master/lib/apisauce.ts
      return {
        error: e,
        ok: false,
        problem: getProblemFromError(e)
      }
    } else {
      return {
        error: new Error(JSON.stringify(e)),
        ok: false,
        problem: UNKNOWN_ERROR
      }
    }
  }
}

/**
 * Throw the response when using SWR.
 */
export const swrFetcher = (url: string) =>
  fetchData(url).then((res) => {
    if (res.ok) return res.data
    else throw res
  })

/**
 * Safe DELETE
 */
export function safeDelete(url: string) {
  return safeFetch(url, toJSON, {
    method: 'DELETE'
  })
}

/**
 * Simple GET
 */
export function getJSON(url: string) {
  return safeFetch(url, toJSON, {headers: defaultHeaders})
}

/**
 * Simple POST
 */
export function postJSON<T>(url: string, json: Partial<T>) {
  return safeFetch<T>(url, toJSON, {
    body: JSON.stringify(json),
    headers: defaultHeaders,
    method: 'POST'
  })
}

/**
 * Simple PUT
 */
export function putJSON(url: string, json: unknown) {
  return safeFetch(url, toJSON, {
    body: JSON.stringify(json),
    headers: defaultHeaders,
    method: 'PUT'
  })
}
