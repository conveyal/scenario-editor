// @flow
import message from '@conveyal/woonerf/message'
import Auth0Lock from 'auth0-lock'

const CLIENT_ID = process.env.AUTH0_CLIENT_ID
const DOMAIN = process.env.AUTH0_DOMAIN

export const authIsRequired = CLIENT_ID && DOMAIN

const localStorage = window && window.localStorage
  ? window.localStorage
  : {
    getItem () {},
    setItem () {}
  }

const lock = authIsRequired
  ? new Auth0Lock(CLIENT_ID, DOMAIN, {
    auth: {
      params: {
        scope: 'openid email profile analyst offline_access'
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
  : {
    checkSession () {},
    getUserInfo () {},
    hide () {},
    logout () {},
    on () {},
    show () {}
  }

function flashError (error) {
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

export function login (next: (any) => void) {
  function handleAuthResult (authResult) {
    console.log('handleAuthResult', authResult)
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
        localStorage.setItem('user', JSON.stringify(profile))
        next({
          ...authResult,
          // idToken: authResult.accessToken, // for woonerf/fetch
          profile
        })
        lock.hide()
      }
    })
  }

  lock.checkSession({}, (error, authResult) => {
    console.log('checkSession', error, authResult)
    if (error || !authResult) {
      lock.show()
      lock.on('authenticated', handleAuthResult)
    } else {
      try {
        const profile = JSON.parse(localStorage.getItem('user'))
        next({
          ...authResult,
          // idToken: authResult.accessToken, // for woonerf/fetch
          profile
        })
        lock.hide()
      } catch (e) {
        console.error('error processing user profile from localStorage', e)
        handleAuthResult(authResult)
      }
    }
  })
}

export function logout () {
  localStorage.removeItem('user')
  lock.logout({returnTo: `${window.location.origin}/login`})
}
