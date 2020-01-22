import fetch from './fetch'

/**
 * We redirect to S3, and due to a bug in Chrome 57, the auth header is
 * forwarded and S3 chokes on that. So we make the request again without the
 * auth header. There's no way to get the URL of the redirect without following
 * it due to browser security restrictions. Do this here so that each request is
 * chained individually, otherwise the signed URLs can expire while we are
 * waiting for other responses.
 *
 * Must be DISPATCHED
 */
export default function fetchSignedS3Url(url) {
  return async function(dispatch) {
    const response = await dispatch(fetch({url: `${url}?redirect=false`}))
    return await dispatch(
      fetch({
        url: response.url,
        options: {
          cache: 'force-cache',
          headers: {
            Authorization: null,
            'X-Conveyal-Access-Group': null
          }
        }
      })
    )
  }
}
