import useSWR, {ConfigInterface, responseInterface} from 'swr'
import {useCallback, useContext} from 'react'

import LogRocket from 'lib/logrocket'
import {UserContext} from 'lib/user'
import {
  postJSON,
  putJSON,
  ResponseError,
  safeDelete,
  SafeResponse
} from 'lib/utils/safe-fetch'

interface UseCollection extends ConfigInterface {
  query?: Record<string, unknown>
  options?: Record<string, unknown>
}

type UseCollectionResponse<T> = {
  create: (properties: T) => Promise<SafeResponse>
  data: T[]
  error?: Error
  remove: (_id: string) => Promise<SafeResponse>
  response: responseInterface<T[], ResponseError>
  update: (_id: string, newProperties: Partial<T>) => Promise<SafeResponse>
}

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

const configToQueryParams = (config?: UseCollection): string => {
  const params = []
  if (config?.query) params.push(`query=${encode(config.query)}`)
  if (config?.options) params.push(`options=${encode(config.options)}`)
  return params.join('&')
}

/**
 * Factory function for creating a hook to use a collection.
 */
export function createUseCollection<T extends CL.IModel>(
  collectionName: string
) {
  return function useCollection(
    config?: UseCollection
  ): UseCollectionResponse<T> {
    const user = useContext(UserContext)
    const url = [`/api/db/${collectionName}`]
    const queryParams = configToQueryParams(config)
    if (queryParams) url.push(queryParams)
    const response = useSWR<T[], ResponseError>([url.join('?'), user], config)
    const {mutate, revalidate} = response
    // Helper function for updating values when using a collection
    const update = useCallback(
      async (_id: string, newProperties: Partial<T>) => {
        try {
          const data = await mutate(async (data: T[]) => {
            const obj = data.find((d) => d._id === _id)
            const res = await putJSON(`/api/db/${collectionName}/${_id}`, {
              ...obj,
              ...newProperties
            })
            if (res.ok) {
              return data.map((d) => (d._id === _id ? (res.data as T) : d))
            } else {
              throw res
            }
          }, false)
          return {ok: true, data}
        } catch (res) {
          return res
        }
      },
      [mutate]
    )

    // Helper function for creating new values and revalidating
    const create = useCallback(
      async (properties: T) => {
        const res = await postJSON(`/api/db/${collectionName}`, properties)
        if (res.ok) {
          revalidate()
        }
        return res
      },
      [revalidate]
    )

    // Helper function when removing values
    const remove = useCallback(
      async (_id) => {
        const res = await safeDelete(`/api/db/${collectionName}/${_id}`)
        if (res.ok) {
          revalidate()
        }
        return res
      },
      [revalidate]
    )

    return {
      create,
      data: response.data,
      error: response.error?.error,
      remove,
      response,
      update
    }
  }
}

// Create an instance of each collection type
export const usePresets = createUseCollection<CL.Preset>('presets')
export const useRegions = createUseCollection<CL.Region>('regions')
