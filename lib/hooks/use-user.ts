import {useUser} from '@auth0/nextjs-auth0'

import {AUTH_DISABLED} from 'lib/constants'
import {localUser, IUser} from 'lib/user'

function useLocalUser() {
  return {
    isLoading: false,
    user: localUser
  }
}

function useIUser() {
  const response = useUser()
  return {
    ...response,
    user: response?.user as IUser
  }
}

export default AUTH_DISABLED ? useLocalUser : useIUser
