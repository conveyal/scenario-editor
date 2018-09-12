// @flow
import fetch from '@conveyal/woonerf/fetch'
import omit from 'lodash/omit'
import {createGrid} from 'browsochrones'
import {push} from 'react-router-redux'

import selectCurrentRegionId from '../../selectors/current-region-id'
import {fetchSignedS3Url} from '../../utils/fetch-signed-s3-url'

import * as select from './selectors'
import type {
  Action,
  Dispatch,
  GetState,
  OpportunityDataset,
  PartialOpportunityDataset,
  ThunkAction,
  UploadStatus
} from './types'

export const addOpportunityDataset =
  (dataset: OpportunityDataset): Action => ({
    type: 'opportunityDatasets/ADD',
    payload: dataset
  })

export const removeOpportunityDataset =
  (dataset: OpportunityDataset): Action => ({
    type: 'opportunityDatasets/REMOVE',
    payload: dataset
  })

export const updateOpportunityDataset =
  (dataset: PartialOpportunityDataset): Action => ({
    type: 'opportunityDatasets/UPDATE',
    payload: dataset
  })

export const setActiveOpportunityDataset =
  (datasetKey?: string): Action => ({
    type: 'opportunityDatasets/SET_ACTIVE',
    payload: datasetKey
  })

export const setOpportunityDatasets =
  (datasets: OpportunityDataset[]): Action => ({
    type: 'opportunityDatasets/SET_ALL',
    payload: datasets
  })

export const updateUploadStatuses =
  (uploadStatuses: UploadStatus[]): Action => ({
    type: 'opportunityDatasets/UPDATE_UPLOAD_STATUSES',
    payload: uploadStatuses
  })

export const goTo = (key: string = '') =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const url = select.opportunitiesUrl(state, {})
    dispatch(push(`${url}${key}`))
  }

export const downloadLODES = () =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = selectCurrentRegionId(state, {})

    dispatch(fetch({
      options: {
        method: 'POST'
      },
      url: `/api/opportunities/region/${regionId}/download`,
      next: (res) => checkUploadStatus()
    }))
  }

export const loadOpportunityDatasets = () =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = selectCurrentRegionId(state, {})
    dispatch(fetch({
      url: `/api/opportunities/region/${regionId}`,
      next: (res) => setOpportunityDatasets(res.value)
    }))
  }

export const editOpportunityDataset = (dataset: OpportunityDataset) =>
  fetch({
    url: `/api/opportunities/${dataset._id}`,
    options: {
      body: omit(dataset, 'grid'),
      method: 'put'
    },
    next: (response) => updateOpportunityDataset(response.value)
  })

export const deleteOpportunityDataset =
  (dataset: OpportunityDataset): ThunkAction =>
    (dispatch: Dispatch, getState: GetState) => {
      const state = getState()
      const datasets = select.opportunityDatasets(state, {})
      const firstOtherDataset = datasets.filter(d => d._id !== dataset._id)[0]
      dispatch(fetch({
        url: `/api/opportunities/${dataset._id}`,
        options: {
          method: 'delete'
        },
        next (response) {
          dispatch(removeOpportunityDataset(dataset))
          if (firstOtherDataset) {
            dispatch(loadOpportunityDataset(firstOtherDataset))
          } else {
            dispatch(setActiveOpportunityDataset())
          }
        }
      }))
    }

export const downloadOpportunityDataset =
  (dataset: OpportunityDataset, format: string): ThunkAction =>
    fetch({
      url: `/api/opportunities/${dataset._id}/${format}?redirect=false`,
      next (res) {
        window.open(res.value.url)
      }
    })

export const loadOpportunityDataset =
  (dataset: PartialOpportunityDataset) => [
    // Set it before loading the next one so that it clears the grid.
    setActiveOpportunityDataset(dataset._id),
    fetchSignedS3Url({
      url: `/api/opportunities/${dataset._id}`,
      next: (res) =>
        updateOpportunityDataset({
          ...dataset,
          grid: createGrid(res.value)
        })
    })
  ]

export const uploadOpportunityDataset = (body: FormData): ThunkAction =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = selectCurrentRegionId(state, {})

    // Set the region id
    body.set('regionId', regionId)

    dispatch(fetch({
      url: `/api/opportunities`,
      options: {
        body,
        method: 'post'
      },
      next: (response) => [
        checkUploadStatus(),
        goTo('/')
      ]
    }))
  }

export const checkUploadStatus = () =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = selectCurrentRegionId(state, {})

    dispatch(fetch({
      url: `/api/opportunities/region/${regionId}/status`,
      next: (response) => updateUploadStatuses(response.value)
    }))
  }

export const clearStatus = (statusId: string) =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const regionId = selectCurrentRegionId(state, {})

    dispatch(fetch({
      url: `/api/opportunities/region/${regionId}/status/${statusId}`,
      options: {
        method: 'delete'
      },
      next: (response) => checkUploadStatus()
    }))
  }

export const deleteSourceSet = (sourceId: string) =>
  fetch({
    url: `/api/opportunities/source/${sourceId}`,
    options: {
      method: 'delete'
    },
    next: (response) => [
      setActiveOpportunityDataset(),
      response.value.map(removeOpportunityDataset)
    ]
  })
