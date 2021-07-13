import {useCallback, useMemo} from 'react'
import createPersistedState from 'use-persisted-state'

import {LS_MOM} from 'lib/constants'

const usePersistedState = createPersistedState(LS_MOM)

/**
 * Store modifications to display on the map in local storage.
 */
export default function useModificationsOnMap() {
  const [state, setState] = usePersistedState<{
    [projecId: string]: string[]
  }>({})

  const isOnMap = useCallback(
    (projectId: string, id: string) => {
      return state[projectId] && state[projectId].includes(id)
    },
    [state]
  )

  const setAll = useCallback(
    (projectId: string, ids: string[]) => {
      setState({[projectId]: ids})
    },
    [setState]
  )

  const toggle = useCallback(
    (projectId: string, toggleId: string) => {
      setState((state) => {
        const ids = state[projectId] ?? []
        const newIds = ids.includes(toggleId)
          ? ids.filter((id) => id !== toggleId)
          : [...ids, toggleId]
        return {
          ...state,
          [projectId]: newIds
        }
      })
    },
    [setState]
  )

  return useMemo(
    () => ({
      forProject: (projectId: string) => state[projectId] ?? [],
      isOnMap,
      setAll,
      state,
      toggle
    }),
    [isOnMap, setAll, state, toggle]
  )
}
