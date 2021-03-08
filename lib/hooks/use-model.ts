import useSWR, {ConfigInterface, responseInterface} from 'swr'
import {useContext, useCallback} from 'react'

import {putJSON, safeDelete, SafeResponse} from 'lib/utils/safe-fetch'

import {UserContext} from '../user'

type UseModelResponse<T> = {
  data: T
  remove: () => Promise<SafeResponse<T>>
  response: responseInterface<T, SafeResponse<T>>
  update: (newProperties: Partial<T>) => Promise<SafeResponse<T>>
}

export function createUseModel<T extends CL.IModel>(collectionName: string) {
  const SWRConfigDefaults: ConfigInterface = {
    // When using a model directly, there's a good chance we are editing it.
    // Revalidating on focus could overwrite local changes.
    revalidateOnFocus: false
  }

  return function useModel(
    _id: string,
    config?: ConfigInterface
  ): UseModelResponse<T> {
    const user = useContext(UserContext)
    const url = `/api/db/${collectionName}/${_id}`
    const response = useSWR<T, SafeResponse<T>>([url, user], {
      ...SWRConfigDefaults,
      ...config
    })
    const {mutate} = response
    const update = useCallback(
      async (newProperties: Partial<T>) => {
        try {
          const data = await mutate(async (data) => {
            const res = await putJSON(url, {
              ...data,
              ...newProperties
            })
            // Update client with final result
            if (res.ok) {
              // TODO schema check here?
              return res.data as T
            } else {
              throw res
            }
          }, false)
          return {ok: true, data}
        } catch (res) {
          return res
        }
      },
      [mutate, url]
    )

    // Should never change
    const remove = useCallback(() => safeDelete(url), [url])

    return {
      data: response.data,
      remove,
      response,
      update
    }
  }
}

export const useRegion = createUseModel<CL.Region>('regions')
export const usePreset = createUseModel<CL.Preset>('presets')
