import useSWR, {ConfigInterface, responseInterface} from 'swr'
import {useCallback} from 'react'

import {
  putJSON,
  ResponseError,
  safeDelete,
  SafeResponse
} from 'lib/utils/safe-fetch'

import {UseDataResponse} from './use-data'
import useUser from './use-user'

export type UseModelResponse<T> = UseDataResponse<T> & {
  data?: T
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
    const user = useUser()
    const url = `/api/db/${collectionName}/${_id}`
    const response = useSWR<T, ResponseError>([url, user], {
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
      error: response.error?.error,
      remove,
      response,
      update,
      url
    }
  }
}

export const useBundle = createUseModel<CL.Bundle>('bundles')
export const useProject = createUseModel<CL.Project>('projects')
export const useRegion = createUseModel<CL.Region>('regions')
export const usePreset = createUseModel<CL.Preset>('presets')
