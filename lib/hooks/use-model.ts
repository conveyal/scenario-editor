import useSWR, {ConfigInterface} from 'swr'
import {useContext, useCallback} from 'react'

import {safeDelete, putJSON} from 'lib/utils/safe-fetch'

import {UserContext} from '../user'

export function createUseModel(collectionName: string) {
  return function useModel(_id: string, config?: ConfigInterface) {
    const user = useContext(UserContext)
    const results = useSWR([`/api/db/${collectionName}/${_id}`, user], config)

    const {data, mutate} = results
    const update = useCallback(
      async (newProperties) => {
        // Optimistically update client side
        mutate({...data, ...newProperties}, false)
        // PUT to server
        const res = await putJSON(`/api/db/${collectionName}/${_id}`, {
          ...data,
          ...newProperties
        })
        // Update client with final result
        if (res.ok) {
          mutate(res.data)
        }
        // Return full response object.
        return res
      },
      [data, _id, mutate]
    )

    return {
      ...results,
      update,
      remove: () => safeDelete(`/api/db/${collectionName}/${_id}`)
    }
  }
}

export const useRegion = createUseModel('regions')
