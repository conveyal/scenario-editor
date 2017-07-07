import Auth0Lock from 'auth0-lock'
import auth0 from 'auth0-js'
import {push} from 'react-router-redux'

import {setUser} from '../actions'
import messages from './messages'

const CLIENT_ID = process.env.AUTH0_CLIENT_ID
const DOMAIN = process.env.AUTH0_DOMAIN
const localStorage = window.localStorage || mockLocalStorage()

export const authIsRequired = CLIENT_ID && DOMAIN

export const lock = authIsRequired
  ? new Auth0Lock(CLIENT_ID, DOMAIN, {
    auth: {
      params: {
        scope: 'openid analyst offline_access'
      },
      redirect: false
    },
    allowSignUp: false,
    theme: {
      logo: 'https://s3-eu-west-1.amazonaws.com/analyst-logos/conveyal-128x128.png',
      primaryColor: '#2389c9'
    },
    closable: true,
    autoclose: true,
    languageDictionary: {
      title: messages.authentication.logIn
    }
  })
  : null

const client = authIsRequired
  ? new auth0.WebAuth({
    clientID: CLIENT_ID,
    domain: DOMAIN
  })
  : null

export function bootstrap (store) {
  setUserAndRefreshIdToken(store)

  lock.on('authenticated', (authResult) => {
    if (!authResult.accessToken) {
      window.alert(`Failed to login. ${authResult.errorDescription}`)
    } else {
      lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          store.dispatch(setUser(null))
          store.dispatch(push('/login'))
        } else {
          const user = {
            ...authResult,
            profile
          }
          localStorage.setItem('user', JSON.stringify(user))
          store.dispatch(setUser(user))
          store.dispatch(push('/'))
        }
      })
    }
  })

  store.subscribe(() => {
    const {user} = store.getState()
    if ((!user || !user.idToken) && window.location.pathname.indexOf('/login') === -1) {
      logout()
    }
  })
}

export function logout () {
  localStorage.removeItem('user') // TODO anything else in local storage?
  client.logout({
    client_id: CLIENT_ID,
    returnTo: `${window.location.origin}/login`
  })
}

function setUserAndRefreshIdToken (store) {
  const userString = localStorage.getItem('user')
  const user = userString && JSON.parse(userString)
  if (user && user.refreshToken) {
    const expDate = new Date(user.idTokenPayload.exp * 1000)
    const now = new Date()
    if (process.env.NODE_ENV !== 'development' && expDate < now) {
      logout()
    } else {
      store.dispatch(setUser(user))
    }
  } else {
    store.dispatch(push('/login'))
  }
}

function mockLocalStorage () {
  if (process.env.NODE_ENV !== 'test') {
    console.error('WARNING! LocalStorage API does not exist. Mocking to prevent errors.')
  }
  return {
    getItem () {},
    setItem () {},
    removeItem () {}
  }
}
