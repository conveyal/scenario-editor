import {FilterQuery, FindOneOptions} from 'mongodb'
import useSWR, {cache, SWRConfiguration, SWRResponse} from 'swr'
import {useCallback, useMemo} from 'react'

import LogRocket from 'lib/logrocket'
import {
  postJSON,
  putJSON,
  ResponseError,
  safeDelete,
  SafeResponse
} from 'lib/utils/safe-fetch'

import {UseDataResponse} from './use-data'
import useUser from './use-user'

export interface UseCollectionResponse<T> extends UseDataResponse<T[]> {
  create: (params: Partial<T>) => Promise<SafeResponse<T>>
  remove: (_id: string) => Promise<SafeResponse<T>>
  response: SWRResponse<T[], ResponseError>
  update: (_id: string, newProperties: Partial<T>) => Promise<SafeResponse<T>>
}

const encode = (o: unknown) => {
  if (o) {
    try {
      return encodeURIComponent(JSON.stringify(o) || '')
    } catch (e) {
      LogRocket.captureException(e)
      return ''
    }
  }
}

function configToQueryParams<T>(
  query?: FilterQuery<T>,
  options?: FindOneOptions<T>
): string {
  const params = []
  if (query) params.push(`query=${encode(query)}`)
  if (options) params.push(`options=${encode(options)}`)
  return params.join('&')
}

function useURL<T>(
  baseURL: string,
  query?: FilterQuery<T>,
  options?: FindOneOptions<T>
): string {
  return useMemo(() => {
    const parts = [baseURL]
    const queryParams = configToQueryParams(query, options)
    if (queryParams) parts.push(queryParams)
    return parts.join('?')
  }, [baseURL, query, options])
}

type UseCollection<T> = {
  query?: FilterQuery<T>
  options?: FindOneOptions<T>
  config?: SWRConfiguration
}

export default function useCollection<T extends CL.IModel>(
  collectionName: string,
  {query, options, config}: UseCollection<T> = {}
): UseCollectionResponse<T> {
  const baseURL = `/api/db/${collectionName}`
  const user = useUser()
  const url = useURL(baseURL, query, options)
  const response = useSWR<T[], ResponseError>([url, user], config)
  const {mutate} = response
  // Helper function for updating values when using a collection
  const update = useCallback(
    async (_id: string, newProperties: Partial<T>) => {
      try {
        const data = await mutate(async (data: T[]) => {
          const obj = data.find((d) => d._id === _id)
          const res = await putJSON(`${baseURL}/${_id}`, {
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
    [baseURL, mutate]
  )

  // Helper function for creating new values and revalidating
  const create = useCallback(
    async (properties: T) => {
      const res = await postJSON<T>(baseURL, properties)
      if (res.ok) {
        cache.clear()
      }
      return res
    },
    [baseURL]
  )

  // Helper function when removing values
  const remove = useCallback(
    async (_id) => {
      const res = await safeDelete(`${baseURL}/${_id}`)
      if (res.ok) {
        cache.clear()
      }
      return res
    },
    [baseURL]
  )

  return {
    create,
    data: response.data,
    error: response.error?.error,
    remove,
    response,
    update,
    url
  }
}

/**
 * Factory function for creating a hook to use a collection.
 */
export function createUseCollection<T extends CL.IModel>(
  collectionName: string
) {
  return function useCollectionType(params?: UseCollection<T>) {
    return useCollection(collectionName, params)
  }
}

// Create an instance of each collection type
export const useBundles = createUseCollection<CL.Bundle>('bundles')
export const useProjects = createUseCollection<CL.Project>('projects')
export const usePresets = createUseCollection<CL.Preset>('presets')
export const useRegions = createUseCollection<CL.Region>('regions')
