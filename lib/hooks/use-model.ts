import useSWR, {cache, SWRConfiguration, SWRResponse} from 'swr'
import {useCallback} from 'react'

import {
  putJSON,
  ResponseError,
  safeDelete,
  SafeResponse
} from 'lib/utils/safe-fetch'

import {UseDataResponse} from './use-data'
import useUser from './use-user'

export interface UseModelResponse<T> extends UseDataResponse<T> {
  remove: () => Promise<SafeResponse<T>>
  response: SWRResponse<T, SafeResponse<T>>
  update: (newProperties: Partial<T>) => Promise<SafeResponse<T>>
}

const SWRConfigDefaults: SWRConfiguration = {
  // When using a model directly, there's a good chance we are editing it.
  // Revalidating on focus could overwrite local changes.
  revalidateOnFocus: false
}

export function createUseModel<T extends CL.IModel>(collectionName: string) {
  return function useModel(
    _id: string,
    config?: SWRConfiguration
  ): UseModelResponse<T> {
    const user = useUser()
    const url = `/api/db/${collectionName}/${_id}`
    const response = useSWR<T, ResponseError>(
      _id == null ? null : [url, user],
      {
        ...SWRConfigDefaults,
        ...config
      }
    )
    const {mutate, revalidate} = response
    const update = useCallback(
      async (newProperties: Partial<T>) => {
        try {
          const data = await mutate(async (data) => {
            const res = await putJSON<T>(url, {
              ...data,
              ...newProperties
            })
            // Update client with final result
            if (res.ok) {
              return res.data
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
    const remove = useCallback(async () => {
      const res = await safeDelete(url)
      if (res.ok) {
        await revalidate()
        cache.clear()
      }
      return res
    }, [revalidate, url])

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
