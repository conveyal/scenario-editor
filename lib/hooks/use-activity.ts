import {dequal} from 'dequal/lite'
import unionBy from 'lodash/fp/unionBy'
import useSWR, {SWRResponse} from 'swr'
import {
  Reducer,
  createContext,
  useCallback,
  useReducer,
  useContext
} from 'react'

import {API} from 'lib/constants'
import {IUser} from 'lib/user'
import authFetch from 'lib/utils/auth-fetch'
import {getParsedItem, stringifyAndSet} from 'lib/utils/local-storage'
import {ResponseError} from 'lib/utils/safe-fetch'

import useEventListener from './user-event-listener'
import useUser from './use-user'

// Merge the incoming tasks array with the one in the browser
const unionById = unionBy<CL.Task>('id')

// Local Storage Activity Key
const LOCAL_STORAGE_KEY = 'conveyal-activity'

const MAX_REFRESH_INTERVAL_MS = 30_000
const FAST_REFRESH_INTERVAL_MS = MAX_REFRESH_INTERVAL_MS / 60
const INITIAL_REFRESH_INTERVAL_MS = MAX_REFRESH_INTERVAL_MS / 8

interface UseActivityResponse {
  removeTask: (taskId: string) => void
  response: SWRResponse<CL.Activity, ResponseError>
  tasks: CL.Task[]
}

// Provide a global context for syncing the activity
export const ActivityContext = createContext<UseActivityResponse>(null)

/**
 * Default hook is a simple context consumer that provides the activity.
 */
export default function useActivity(): UseActivityResponse {
  return useContext(ActivityContext)
}

/**
 * SWR expects errors to throw.
 */
async function swrFetcher(user: IUser) {
  const response = await authFetch<CL.Activity>(API.Activity, user)
  if (response.ok) return response.data
  throw response
}

interface State {
  hiddenTaskIds: string[]
  previousData: void | CL.Activity
  refreshInterval: number
  tasks: CL.Task[]
}

const initialState: State = {
  // Locally hidden task ids.
  hiddenTaskIds: [],
  // Track the previously returned data to monitor changes. On new data, speed up the polling.
  previousData: null,
  refreshInterval: INITIAL_REFRESH_INTERVAL_MS,
  tasks: []
}

type Actions =
  | {type: 'hide-task-id'; taskId: string}
  | {type: 'local-storage-sync'; state: State}
  | {type: 'set-incoming-data'; data: CL.Activity}

// Retrieve the data from localStorage
function initializeFromLocalStorage(arg: State): State {
  const localState = getParsedItem(LOCAL_STORAGE_KEY)
  if (localState != null) {
    return localState as State
  }
  return arg
}

// Sync with local store
function locallyStore(state: State): State {
  stringifyAndSet(LOCAL_STORAGE_KEY, state)
  return state
}

const taskReducer: Reducer<State, Actions> = (state, action) => {
  const filterHiddenTasks = (t: CL.Task) => !state.hiddenTaskIds.includes(t.id)
  switch (action.type) {
    case 'hide-task-id':
      return locallyStore({
        ...state,
        hiddenTaskIds: [...state.hiddenTaskIds, action.taskId],
        tasks: state.tasks.filter((t) => t.id !== action.taskId)
      })
    case 'local-storage-sync':
      return locallyStore(action.state ?? initialState)
    case 'set-incoming-data':
      // Initialize with `null` to prevent speeding up refresh on initial load.
      if (state.previousData == null) {
        return locallyStore({
          ...state,
          previousData: action.data,
          tasks: action.data.taskProgress.filter(filterHiddenTasks)
        })
      } else if (!dequal(state.previousData, action.data)) {
        return locallyStore({
          ...state,
          previousData: action.data,
          // Merge local tasks with tasks from the server, overwriting the local ones.
          tasks: unionById(action.data.taskProgress, state.tasks).filter(
            filterHiddenTasks
          ),
          // Speed up the refresh interval when the data has changed
          refreshInterval: FAST_REFRESH_INTERVAL_MS
        })
      } else if (state.refreshInterval < MAX_REFRESH_INTERVAL_MS) {
        return locallyStore({
          ...state,
          // Slow down the refresh interval if the data is the same
          refreshInterval: state.refreshInterval * 2
        })
      }
      // No new data, no changes needed to refresh interval
      return state
  }
}

/**
 * Fetch the activity from the API server. Use a default refresh interval that speeds up if
 * the data returned from the server has changed. If the data does not change, increase the interval
 * on each fetch until it returns to the max again.
 *
 * Note: this should only be used to create the data to provide as a value to the `ActivityContext`. All
 * other instances should use the default hook.
 */
export function useActivitySync(): UseActivityResponse {
  const {user} = useUser()
  const [state, dispatch] = useReducer(
    taskReducer,
    initialState,
    initializeFromLocalStorage
  )

  // Handle localStorage syncing
  useEventListener('storage', (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY) {
      dispatch({
        type: 'local-storage-sync',
        state: JSON.parse(event.newValue) as State
      })
    }
  })

  // Remove a task from the local array of tasks, should only be shown when a task is no longer active.
  const removeTask = useCallback(
    (taskId: string) => dispatch({type: 'hide-task-id', taskId}),
    []
  )

  // Set data manually on each response.
  const onSuccess = useCallback(
    (data: CL.Activity) => dispatch({type: 'set-incoming-data', data}),
    []
  )

  // Request activity on a specific interval
  const response = useSWR<CL.Activity, ResponseError>(
    user ? [user] : null,
    swrFetcher,
    {
      onSuccess,
      refreshInterval: state.refreshInterval,
      refreshWhenOffline: true, // Status bar updates
      revalidateOnFocus: true // Trigger a refresh when the tab is refocuse
    }
  )

  return {
    removeTask,
    response,
    tasks: state.tasks
  }
}
