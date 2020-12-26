// TODO schedule session refresh
import get from 'lodash/get'
import {createContext, useEffect} from 'react'
import useSWR from 'swr'

import LogRocket from './logrocket'

const isServer = typeof window === 'undefined'
const isDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

export interface IUser {
  accessGroup: string
  adminTempAccessGroup?: string
  email: string
  idToken?: string
}

// Tell TypeScript that we attach the user to the window object
declare global {
  interface Window {
    __user?: IUser
  }
}

// When auth is disabled, use a local user
const localUser: IUser = {
  accessGroup: 'local',
  adminTempAccessGroup: null,
  email: 'local'
}

// Allow components to consume the user without needing to drill it down
export const UserContext = createContext(null)

// Helper functions to hide storage details
// Store on `window` so that each new tab/window needs to check the session
export function getUser(serverSideUser?: IUser): IUser | void {
  if (isDisabled) return localUser
  if (isServer) return serverSideUser
  return window.__user || serverSideUser
}

export function removeUser(): void {
  if (isServer) return
  delete window.__user
}

export function storeUser(user: IUser): void {
  if (isServer) return

  // Identify the user for LogRocket
  LogRocket.identify(user.email, {
    accessGroup: user.accessGroup,
    email: user.email
  })

  // Store the user on window, requiring a new session on each tab/page
  window.__user = user
}

export function getIdToken(): string | void {
  return get(getUser(), 'idToken')
}

/**
 * Client side redirect to login.
 */
function goToLogin() {
  if (isServer || isDisabled) return

  const redirectTo = encodeURIComponent(
    window.location.pathname + window.location.search
  )
  const loginHref = `/api/login?redirectTo=${redirectTo}`
  window.location.href = loginHref
}

/**
 * Get the user. Checks if it's stored in the client or retrieves it by
 * making an API call. If authentication is disabled it short circuits the process
 * by returning a local user.
 */
export function useFetchUser(
  serverSideUser?: IUser
): {
  user?: IUser
  isValidating?: boolean
} {
  const {data: user, error, isValidating} = useSWR('/api/session', {
    initialData: getUser(serverSideUser)
  })

  if (error) {
    removeUser()
    goToLogin()
  }

  useEffect(() => {
    if (user) storeUser(user)
  }, [user])

  if (user) return {user}
  else return {isValidating}
}
