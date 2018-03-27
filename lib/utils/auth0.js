// @flow
import message from '@conveyal/woonerf/message'

import localStorage from './local-storage'

const CLIENT_ID = process.env.AUTH0_CLIENT_ID
const DOMAIN = process.env.AUTH0_DOMAIN

// If client & domain exist, then require authentication
export const authIsRequired: boolean = !!(CLIENT_ID && DOMAIN)

// The default Auth0 scope to request
const scope = 'openid email profile analyst offline_access'

/**
 * Initialize in a function call so that the Auth0 lock code isn't executed
 * until needed. When Auth0 code is "required" it saves the origin. This is a
 * problem when a user goes to another part of the site (ex: `/regions/create`)
 * and we want to `checkSession` before allowing them to continue. Each "origin"
 * must be saved in the Auth0 Dashboard (which is impossible due to IDs). So
 * instead we redirect to `/login`, `checkSession`, and redirect back to the
 * original path given.
 */
function initializeLock () {
  const Auth0Lock = require('auth0-lock').default
  const lock = new Auth0Lock(CLIENT_ID, DOMAIN, {
    auth: {
      params: {
        scope
      },
      redirect: false
    },
    allowSignUp: false,
    theme: {
      logo: 'https://s3-eu-west-1.amazonaws.com/analyst-logos/conveyal-128x128.png',
      primaryColor: '#2389c9'
    },
    closable: false,
    languageDictionary: {
      title: message('authentication.logIn')
    }
  })

  const flashError = (error) => {
    console.error(error)
    lock.show({
      flashMessage: {
        type: 'error',
        text: error.error_description
      }
    })
  }

  // Set the default handler for auth errors
  lock.on('authorization_error', flashError)
  lock.on('unrecoverable_error', flashError)

  return lock
}

export function login (next: (any) => void) {
  const lock = initializeLock()

  function handleAuthResult (authResult) {
    lock.getUserInfo(authResult.accessToken, (error, profile) => {
      if (error) {
        localStorage.removeItem('user')
        lock.show({
          flashMessage: {
            type: 'error',
            text: error.error_description
          }
        })
      } else {
        localStorage.setItem('user', JSON.stringify({
          ...profile,
          ...authResult
        }))
        next({
          ...profile,
          ...authResult
        })
        lock.hide()
      }
    })
  }

  lock.checkSession({
    responseType: 'code id_token token',
    scope,
    timeout: '1000'
  }, (error, authResult) => {
    if (error || !authResult) {
      lock.show()
      lock.on('authenticated', handleAuthResult)
    } else {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        next({
          ...user,
          ...authResult
        })
        lock.hide()
      } catch (e) {
        console.error('error processing user profile from localStorage', e)
        handleAuthResult(authResult)
      }
    }
  })
}

/**
 * Log out and reload the page.
 */
export function logout () {
  localStorage.removeItem('user')

  const lock = initializeLock()

  lock.logout({
    clientID: CLIENT_ID,
    returnTo: `${window.location.origin}/login`
  })

  // Don't push state, do a full reload
  window.location = '/login'
}
