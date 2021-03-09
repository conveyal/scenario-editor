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
import {UseDataResponse} from './use-data'

interface UseCollection extends ConfigInterface {
  query?: Record<string, unknown>
  options?: Record<string, unknown>
}

export type UseCollectionResponse<T> = UseDataResponse<T> & {
  create: (properties: T) => Promise<SafeResponse<T>>
  data: T[]
  remove: (_id: string) => Promise<SafeResponse<T>>
  response: responseInterface<T[], ResponseError>
  update: (_id: string, newProperties: Partial<T>) => Promise<SafeResponse<T>>
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

function useURL(baseURL: string, config?: UseCollection): string {
  const parts = [baseURL]
  const queryParams = configToQueryParams(config)
  if (queryParams) parts.push(queryParams)
  return parts.join('?')
}

/**
 * Factory function for creating a hook to use a collection.
 */
export function createUseCollection<T extends CL.IModel>(
  collectionName: string
) {
  const baseURL = `/api/db/${collectionName}`
  return function useCollection(
    config?: UseCollection
  ): UseCollectionResponse<T> {
    const user = useContext(UserContext)
    const url = useURL(baseURL, config)
    const response = useSWR<T[], ResponseError>([url, user], config)
    const {mutate, revalidate} = response
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
      [mutate]
    )

    // Helper function for creating new values and revalidating
    const create = useCallback(
      async (properties: T) => {
        const res = await postJSON(baseURL, properties)
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
        const res = await safeDelete(`${baseURL}/${_id}`)
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
      update,
      url
    }
  }
}

// Create an instance of each collection type
export const useBundles = createUseCollection<CL.Bundle>('bundles')
export const useProjects = createUseCollection<CL.Project>('projects')
export const usePresets = createUseCollection<CL.Preset>('presets')
export const useRegions = createUseCollection<CL.Region>('regions')
