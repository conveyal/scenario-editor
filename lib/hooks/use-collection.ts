import useSWR, {ConfigInterface} from 'swr'
import {useContext} from 'react'

import LogRocket from '../logrocket'

import {UserContext} from '../user'

const encode = (o: Record<string, unknown> | void) => {
  if (o) {
    try {
      return encodeURIComponent(JSON.stringify(o) || '')
    } catch (e) {
      LogRocket.captureException(e)
      return ''
    }
  }
}

interface UseCollection extends ConfigInterface {
  query?: Record<string, unknown>
  options?: Record<string, unknown>
}

export function createUseCollection(collectionName) {
  return function useCollection(config?: UseCollection) {
    const user = useContext(UserContext)
    const baseURL = `/api/db/${collectionName}`
    const queryParams = `query=${encode(config.query)}&options=${encode(
      config.options
    )}`
    return useSWR([`${baseURL}?${queryParams}`, user], config)
  }
}

export const useRegions = createUseCollection('regions')
