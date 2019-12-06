import auth0 from 'auth0-js'
import Cookie from 'js-cookie'
import get from 'lodash/get'
import nextCookies from 'next-cookies'

import localStorage from 'lib/utils/local-storage'

let LogRocket = {identify() {}}
if (process.env.LOGROCKET && process.env.NODE_ENV === 'production') {
  LogRocket = require('logrocket')
  LogRocket.init(process.env.LOGROCKET)
}

// Check if the passed in group matches the environment variable
const isAdmin = group => group === process.env.ADMIN_ACCESS_GROUP

// Create a style element that changes the display of elements with the .DEV CSS class
function showDevFeatures() {
  if (!process.browser) return
  // Don't add it twice
  if (document.getElementById('DEVSTYLE')) return
  const styleNode = document.createElement('style')
  styleNode.id = 'DEVSTYLE'
  styleNode.innerText = '.DEV {display: inherit;}'
  document.head.appendChild(styleNode)
}

// Key to use for cookie storage
const COOKIE_KEY = 'user'

// Scope to request from Auth0
const AUTH0_SCOPE = 'email analyst'

const clientID = process.env.AUTH0_CLIENT_ID
const domain = process.env.AUTH0_DOMAIN

// If client & domain exist, then require authentication
const authIsRequired =
  process.env.NODE_ENV !== 'test' && !process.env.AUTH_DISABLED

// Check if auth result is valid
const resultIsValid = r => r && r.accessToken && r.idToken

// WebAuth client instance
export let client

// Redux Action
function setUser(user) {
  return {
    type: 'set user',
    payload: user
  }
}

// Handle auth
export async function isAuthenticated(ctx) {
  // Always show dev features in offline mode
  if (!authIsRequired) {
    ctx.store.dispatch(setUser({accessGroup: 'local', email: 'local'}))
    return showDevFeatures()
  }

  const now = new Date().getTime()
  // Check if a valid user is in the store
  let user = ctx.store.getState().user
  if (!user || !user.accessGroup || user.expiresAt < now) {
    // Next check the cookie
    const cookie = nextCookies(ctx)
    const adminTempAccessGroup = cookie.adminTempAccessGroup
    user = cookie.user

    // Ensure user exists and is valid
    if (!user || typeof user.expiresAt !== 'number')
      throw new Error('User not logged in')

    // Only attempt to renew the session in the browser
    if (process.browser && user.expiresAt < now) {
      // Renew session will throw an error if it fails
      user = await renewSession()
    }

    ctx.store.dispatch(setUser({...user, adminTempAccessGroup}))
  }

  if (isAdmin(user.accessGroup)) showDevFeatures()
  return user
}

/**
 * Import and initialize WebAuth.
 */
function getAuth0Client(origin) {
  return new auth0.WebAuth({
    clientID,
    domain,
    redirectUri: `${origin || window.location.origin}/callback`,
    responseType: 'code id_token token',
    scope: AUTH0_SCOPE
  })
}

/**
 * Called when redirected back from log in domain.
 */
export function handleAuth0Callback() {
  const client = getAuth0Client()
  return new Promise((resolve, reject) => {
    client.parseHash((err, authResult) => {
      if (err) return reject(err)
      if (!resultIsValid(authResult)) return reject('Auth result invalid')
      const user = createUserFromAuthResult(authResult)
      setSession(user)
      resolve(user)
    })
  })
}

/**
 * Kick off the Auth0 Login which redirects to the login domain.
 */
export function login() {
  getAuth0Client().authorize()
}

function createUserFromAuthResult(authResult) {
  // Set the time that the Access Token will expire at
  const expiresAt = authResult.expiresIn * 1000 + new Date().getTime()

  // Get the email and accessGroup for LogRocket
  const payload = authResult.idTokenPayload
  const email = payload.email
  const accessGroup = get(payload, 'analyst.group')

  // Form the user data
  return {
    accessGroup,
    expiresAt,
    email,
    idToken: authResult.idToken
  }
}

/**
 * Store the user data in a cookie and set up a renewal interval.
 */
function setSession(user) {
  // Set with localStorage to work across all browser windows
  localStorage.setItem('isLoggedIn', 'true')

  // Initialize the LogRocket session
  LogRocket.identify(user.email, {accessGroup: user.accessGroup})

  // Store in cookie for server rendering
  Cookie.set(COOKIE_KEY, user, {expires: new Date(user.expiresAt)})
}

// Renew without needing to log in again
export function renewSession() {
  const client = getAuth0Client(origin)
  return new Promise((resolve, reject) => {
    client.checkSession({}, (err, authResult) => {
      if (err) return reject(err)
      if (!resultIsValid(authResult)) {
        return reject(new Error('Renew session result is invalid.'))
      }

      const user = createUserFromAuthResult(authResult)
      setSession(user)
      resolve(user)
    })
  })
}

// Remove all data and log out
export function logout() {
  const client = getAuth0Client()

  Cookie.remove(COOKIE_KEY)

  // Log out across all open windows
  localStorage.removeItem('isLoggedIn')

  // Log out with Auth0
  client.logout({
    clientID,
    returnTo: window.location.origin
  })
}
