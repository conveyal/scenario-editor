import httpProxy from 'http-proxy'
import omit from 'lodash/omit'
import qs from 'querystring'

const proxy = httpProxy.createProxyServer({
  prependPath: false, // use target pased in
  secure: false // skip SSL validation
})

// Set the Authorization header
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  if (options.accessGroup && options.accessGroup !== 'undefined') {
    proxyReq.setHeader('X-Conveyal-Access-Group', options.accessGroup)
  }

  proxyReq.setHeader('Authorization', `bearer ${options.idToken}`)
})

// Close proxy when lambda closes
process.on('exit', () => proxy.close())

// API_URL set now.json
const API_URL = process.env.API_URL

/**
 * Proxy the incoming request to the Java API server.
 */
export default function(req, res) {
  try {
    const accessGroup = req.cookies.adminTempAccessGroup
    const idToken = JSON.parse(req.cookies.user).idToken
    const {proxyTarget} = req.query
    const forwardedQueryString = qs.stringify(omit(req.query, 'proxyTarget'))
    const url = API_URL + proxyTarget + '?' + forwardedQueryString
    req.url = url
    proxy.web(req, res, {accessGroup, idToken, target: url})
  } catch (e) {
    res.statusCode = 401
    res.status(401).json({status: 'Unauthorized', error: e.message})
  }
}
