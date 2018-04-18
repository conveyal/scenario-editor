// @flow
import type {Action, State} from './types'

const initialState: State = {
  jobs: [],

  workers: [],
  workersSortBy: ['jvmStartTime']
}

export default function reducer (state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'admin/SET_WORKERS_SORT_BY':
      return {
        ...state,
        workersSortBy: action.payload
      }
    case 'admin/SET_JOBS':
      return {
        ...state,
        jobs: action.payload
      }
    case 'admin/SET_WORKERS':
      const workers = [...state.workers]
      action.payload.forEach(currentWorker => {
        const index = workers.findIndex(w => w.workerId === currentWorker.workerId)
        currentWorker.lastSeenAt = Date.now() - (currentWorker.seenSecondsAgo * 1000)
        if (index === -1) {
          workers.push({
            ...currentWorker,
            loadHistory: [currentWorker.loadAverage],
            memoryHistory: [currentWorker.memoryTotal],
            taskHistory: [currentWorker.tasksPerMinute]
          })
        } else {
          workers[index] = {
            ...currentWorker,
            loadHistory: [
              ...workers[index].loadHistory, currentWorker.loadAverage
            ].slice(-100), // keep only the 100 latest
            memoryHistory: [
              ...workers[index].memoryHistory,
              currentWorker.memoryTotal
            ].slice(-100),
            taskHistory: [
              ...workers[index].taskHistory,
              currentWorker.tasksPerMinute
            ].slice(-100)
          }
        }
      })

      return {
        ...state,
        workers
      }
  }
  return state
}
