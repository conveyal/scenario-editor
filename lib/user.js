// TODO schedule session refresh
import Cookie from 'js-cookie'
import get from 'lodash/get'
import React from 'react'

import LogRocket from './logrocket'

const isServer = typeof window === 'undefined'
const isDisabled =
  process.env.NEXT_PUBLIC_AUTH_DISABLED === true ||
  process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

// When auth is disabled, use a local user
const localUser = {
  accessGroup: 'local',
  email: 'local'
}

// Allow components to consume the user without needing to drill it down
export const UserContext = React.createContext()

// Helper functions to hide storage details
// Store on `window` so that each new tab/window needs to check the session
export function getUser() {
  if (isDisabled) return localUser
  if (isServer) return
  return window.__user
}

export function removeUser() {
  if (isServer) return
  delete window.__user
}

/**
 * Parses the response from the `/api/session` endpoint which calls `auth0.getSession`.
 */
export function parseUser(json) {
  const user = get(json, 'user', {})
  // This is a namespace for a custom claim. Not a URL: https://auth0.com/docs/tokens/guides/create-namespaced-custom-claims
  const accessGroup = user['http://conveyal/accessGroup']
  const email = get(user, 'name')
  return {
    accessGroup,
    // Set the `adminTempAccessGroup` here if it exists
    adminTempAccessGroup: Cookie.get('adminTempAccessGroup'),
    email,
    idToken: get(json, 'idToken')
  }
}

export function storeUser(user) {
  if (isServer) return

  // Identify the user for LogRocket
  LogRocket.identify(user.email, {
    accessGroup: user.accessGroup,
    email: user.email
  })

  // Store the user on window, requiring a new session on each tab/page
  window.__user = user
}

export function getIdToken() {
  return get(getUser(), 'idToken')
}

async function fetchSession() {
  // If there's a stored user, return that
  const storedUser = getUser()
  if (storedUser) return storedUser

  const res = await fetch('/api/session')
  if (!res.ok) {
    removeUser()
    return null
  }

  const newUser = parseUser(await res.json())
  // Store the user
  storeUser(newUser)
  return newUser
}

/**
 * Get the user. Checks if it's stored in the client or retrieves it by
 * making an API call. If authentication is disabled it short circuits the process
 * by returning a local user.
 */
export function useFetchUser({required} = {}) {
  const [loading, setLoading] = React.useState(() => !getUser())
  const [user, setUser] = React.useState(() => getUser())

  React.useEffect(
    () => {
      if (!loading && user) {
        return
      }
      setLoading(true)
      let isMounted = true

      const goToLogin = () => {
        const redirectTo = encodeURIComponent(
          window.location.pathname + window.location.search
        )
        const loginHref = `/api/login?redirectTo=${redirectTo}`
        window.location.href = loginHref
      }

      fetchSession()
        .then((user) => {
          // Only set the user if the component is still mounted
          if (isMounted) {
            // When the user is not logged in but login is required
            if (required && !user) {
              return goToLogin()
            }
            setUser(user)
            setLoading(false)
          }
        })
        .catch((err) => {
          console.error(err)
          // Clear localStorage before redirecting
          removeUser()
          goToLogin()
        })

      return () => {
        isMounted = false
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {user, loading}
}
