import get from 'lodash/get'
import useSWR from 'swr'
import {useContext} from 'react'

import fetch from './utils/fetch'

import {AuthContext} from './auth'
import {API_URL} from './constants'

export default function useAuthenticatedSWR(
  request = {},
  {initialData, ...config} = {}
) {
  // Get the user and set the auth headers
  const user = useContext(AuthContext)
  const idToken = get(user, 'idToken')
  const adminTempAccessGroup = get(user, 'adminTempAccessGroup')
  request.headers = {
    Authorization: `bearer ${idToken}`,
    'X-Conveyal-Access-Group': adminTempAccessGroup,
    ...request.headers
  }

  // Turn on CORS mode
  request.mode = 'cors'

  return useSWR(
    JSON.stringify(request),
    () => fetch(API_URL + request.url, request).then(r => r.json()),
    {
      ...config,
      initialData: initialData && {
        status: 200,
        statusText: 'InitialData',
        headers: {},
        data: initialData
      }
    }
  )
}
