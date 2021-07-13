import {FilterQuery, FindOneOptions} from 'mongodb'
import {useRouter} from 'next/router'
import useSWR, {SWRConfiguration, SWRResponse} from 'swr'
import {useCallback, useMemo} from 'react'

import {
  postJSON,
  putJSON,
  ResponseError,
  safeDelete,
  SafeResponse
} from 'lib/utils/safe-fetch'

import {UseDataResponse} from './use-data'
import useQueryURL from './use-query-url'
import useUser from './use-user'

export interface UseCollectionResponse<T> extends UseDataResponse<T[]> {
  create: (params: Partial<T>) => Promise<SafeResponse<T>>
  remove: (_id: string) => Promise<SafeResponse<T>>
  response: SWRResponse<T[], ResponseError>
  update: (_id: string, newProperties: Partial<T>) => Promise<SafeResponse<T[]>>
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
  const router = useRouter()
  const baseURL = `/api/db/${collectionName}`
  const {isLoading, user} = useUser()
  const url = useQueryURL(baseURL, query, options)
  const response = useSWR<T[], ResponseError>(
    () => (router.isReady && !isLoading ? [url, user] : null),
    config
  )
  const emptyArray = useMemo<T[]>(() => [], [])
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
        await mutate()
      }
      return res
    },
    [baseURL, mutate]
  )

  // Helper function when removing values
  const remove = useCallback(
    async (_id) => {
      const res = await safeDelete(`${baseURL}/${_id}`)
      if (res.ok) {
        await mutate()
      }
      return res
    },
    [baseURL, mutate]
  )

  return {
    create,
    data: response.data ?? emptyArray,
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
    return useCollection<T>(collectionName, params)
  }
}

// Create an instance of each collection type
export const useAggregationAreas =
  createUseCollection<CL.AggregationArea>('aggregationAreas')
export const useBundles = createUseCollection<CL.Bundle>('bundles')
export const useModifications =
  createUseCollection<CL.Modification>('modifications')
export const useSpatialDatasets = createUseCollection<CL.SpatialDataset>(
  'opportunityDatasets'
)
export const useProjects = createUseCollection<CL.Project>('projects')
export const usePresets = createUseCollection<CL.Preset>('presets')
export const useRegions = createUseCollection<CL.Region>('regions')
export const useScenarios = createUseCollection<CL.Scenario>('scenarios')
export const useScenariosModifications =
  createUseCollection<CL.ScenariosModifications>('scenariosModifications')
