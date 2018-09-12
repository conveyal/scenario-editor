// @flow

export type Action = any

export type Job = any

export type Worker = any

export type State = {
  jobs: Job[],
  workers: Worker[],
  workersSortBy: string[]
}
