import axios from 'axios'
import useSWR from 'swr'

export default function useRequest(
  request = {},
  {initialData, ...config} = {}
) {
  const {data: response, ...rest} = useSWR(
    JSON.stringify(request),
    () => axios(request),
    {
      ...config,
      initialData: initialData && {
        status: 200,
        statusText: 'InitialData',
        headers: {},
        data: initialData
      }
    }
  )

  return {
    data: response && response.data,
    ...rest
  }
}

/**
 * Rewrite the url to use the Lambda Proxy server. URLs must be relative.
 */
export function useProxyRequest(request, options) {
  let proxyTarget
  // Request can be an object or url string
  if (typeof request === 'string') {
    proxyTarget = request
    request = {}
  } else {
    proxyTarget = request.url
  }

  request.url = '/api/proxy'
  request.params = {
    ...(request.params || {}),
    proxyTarget
  }

  return useRequest(request, options)
}
