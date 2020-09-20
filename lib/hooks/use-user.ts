import get from 'lodash/get'
import {useContext} from 'react'

import {UserContext} from '../user'

export default function useUser() {
  const user = useContext(UserContext)
  const accessGroup =
    get(user, 'adminTempAccessGroup') || get(user, 'accessGroup')
  const email = get(user, 'email')

  return {
    ...user,
    accessGroup,
    email
  }
}
