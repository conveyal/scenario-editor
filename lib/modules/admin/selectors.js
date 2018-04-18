// @flow
import _max from 'lodash/max'
import _sortBy from 'lodash/sortBy'
import {createSelector} from 'reselect'

import type {State} from './types'

type AppState = {
  admin: State
}

export const jobs = (state: AppState) => _sortBy(state.admin.jobs, 'createdAt')
export const workers = (state: AppState) => state.admin.workers
export const workersSortBy = (state: AppState) => state.admin.workersSortBy

export const allBundlesById = createSelector(
  workers,
  workers => {
    const bundles = {}
    workers.forEach(w => w.bundles.forEach(b => {
      bundles[b._id] = b
    }))
    return bundles
  }
)

export const maxTasksPerMinute = createSelector(
  workers,
  workers => _max(workers.map(w => _max(w.taskHistory)))
)

export const maxLoad = createSelector(
  workers,
  workers => _max(workers.map(w => _max(w.loadHistory)))
)
