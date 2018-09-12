// @flow
/* eslint-disable no-use-before-define */

import type {Grid} from '../../types'

export type OpportunityDataset = {
  _id: string,
  grid?: Grid,
  key: string,
  name: string,
  regionId: string,
  sourceId: string,
  sourceName: string
}

export type PartialOpportunityDataset = {
  _id: string,
  grid?: Grid,
  key?: string,
  name?: string,
  sourceId?: string,
  sourceName?: string
}

export type UploadStatus = {
  completedAt: string,
  completedFeatures: number,
  createdAt: string,
  id: string,
  message: string,
  name: string,
  status: 'DONE' | 'ERROR' | 'PROCESSING' | 'UPLOADING',
  totalFeatures: number,
  totalGrids: number,
  uploadedGrids: number
}

export type State = {
  +activeDataset: void | string,
  +datasets: OpportunityDataset[],
  +uploadStatuses: UploadStatus[]
}

export type Action =
  {payload: OpportunityDataset, type: 'opportunityDatasets/ADD'}
| {payload: OpportunityDataset, type: 'opportunityDatasets/REMOVE'}
| {payload: OpportunityDataset[], type: 'opportunityDatasets/SET_ALL'}
| {payload: void | string, type: 'opportunityDatasets/SET_ACTIVE'}
| {payload: PartialOpportunityDataset, type: 'opportunityDatasets/UPDATE'}
| {payload: UploadStatus[], type: 'opportunityDatasets/UPDATE_UPLOAD_STATUSES'}

export type Actions =
  Action
| Array<Action>
| FetchAction
| PromiseAction
| ThunkAction

export type Dispatch = (action: Actions) => any

export type FetchAction = {
  type: 'fetch'
}

export type GetState = () => any

export type PromiseAction = Promise<Action>

export type ThunkAction = (dispatch: Dispatch, getState: () => GetState) => any
