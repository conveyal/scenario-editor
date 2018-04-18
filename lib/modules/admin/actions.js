// @flow
import fetch from '@conveyal/woonerf/fetch'

import type {Action, Job, Worker} from './types'

const JOBS_URL = '/api/jobs'
const WORKERS_URL = '/api/workers'

export const setJobs = (payload: Job[]): Action => ({
  type: 'admin/SET_JOBS',
  payload
})

export const setWorkers = (payload: Worker[]): Action => ({
  type: 'admin/SET_WORKERS',
  payload
})

export const fetchJobs = () =>
  fetch({
    url: JOBS_URL,
    next: (response) => setJobs(response.value)
  })

export const fetchWorkers = () =>
  fetch({
    url: WORKERS_URL,
    next: (response) => setWorkers(response.value)
  })
