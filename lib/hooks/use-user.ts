import {useUser} from '@auth0/nextjs-auth0'

import {AUTH_DISABLED} from 'lib/constants'
import {localUser, IUser} from 'lib/user'

export default AUTH_DISABLED ? () => localUser : () => useUser()?.user as IUser
