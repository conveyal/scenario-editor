// @flow

export type Action = any

export type Job = any

export type Worker = any

export type State = {
  jobs: Job[],
  workersSortBy: string[],
  workers: Worker[]
}
