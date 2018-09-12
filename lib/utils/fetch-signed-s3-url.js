// @flow
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'

/**
 * We redirect to S3, and due to a bug in Chrome 57, the auth header is
 * forwarded and S3 chokes on that. So we make the request again without the
 * auth header. There's no way to get the URL of the redirect without following
 * it due to browser security restrictions. Do this here so that each request is
 * chained individually, otherwise the signed URLs can expire while we are
 * waiting for other responses.
 */
export function fetchSignedS3Url ({url, next}: {next: (any) => any, url: string}) {
  return fetch({
    url: `${url}?redirect=false`,
    next: (res) =>
      fetch({
        url: res.value.url,
        options: {
          headers: {
            Authorization: null
          }
        },
        next
      })
  })
}

export function fetchMultipleSignedS3Urls ({urls, next}: {next: (any) => any, urls: string[]}) {
  return fetchMultiple({
    fetches: urls.map(url => ({url: `${url}?redirect=false`})),
    next: (responses) =>
      fetchMultiple({
        fetches: responses.map(res => ({
          url: res.value.url,
          options: {
            headers: {
              Authorization: null
            }
          }
        })),
        next
      })
  })
}
