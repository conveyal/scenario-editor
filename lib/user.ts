import {UserProfile} from '@auth0/nextjs-auth0'
import get from 'lodash/get'

import LogRocket from './logrocket'

const isServer = typeof window === 'undefined'
const isDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

export interface IUser extends UserProfile {
  accessGroup: string
  adminTempAccessGroup?: string
  idToken?: string
}

// Tell TypeScript that we attach the user to the window object
declare global {
  interface Window {
    __user?: IUser
    zE: any
  }
}

// When auth is disabled, use a local user
const localUser: IUser = {
  accessGroup: 'local',
  adminTempAccessGroup: null,
  email: 'local'
}

// Helper functions to hide storage details
// Store on `window` so that each new tab/window needs to check the session
export function getUser(serverSideUser?: IUser): undefined | IUser {
  if (isDisabled) return localUser
  if (isServer) return serverSideUser
  return window.__user || serverSideUser
}

export function storeUser(user: IUser): void {
  if (isServer) return

  // Identify the user for LogRocket
  LogRocket.identify(user.email, {
    accessGroup: user.accessGroup,
    email: user.email
  })

  // Identify the user for ZenDesk
  if (window.zE) {
    window.zE(() => {
      window.zE.identify({
        name: user.email,
        email: user.email,
        organization: user.accessGroup
      })
    })
  }

  // Store the user on window, requiring a new session on each tab/page
  window.__user = user
}

export function getIdToken(): string | void {
  return get(getUser(), 'idToken')
}
