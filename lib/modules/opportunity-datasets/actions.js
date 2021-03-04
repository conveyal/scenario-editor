import omit from 'lodash/omit'
import Router from 'next/router'

import fetch from 'lib/actions/fetch'
import fetchSignedS3Url from 'lib/actions/fetch-signed-s3-url'
import {API} from 'lib/constants'
import {pageToHref} from 'lib/router'
import createGrid from 'lib/utils/create-grid'
import setSearchParameter from 'lib/utils/set-search-parameter'

const OPP_URL = API.Opportunities

export const addOpportunityDataset = (dataset) => ({
  type: 'opportunityDatasets/ADD',
  payload: dataset
})

export const removeOpportunityDataset = (dataset) => ({
  type: 'opportunityDatasets/REMOVE',
  payload: dataset
})

export const updateOpportunityDataset = (dataset) => ({
  type: 'opportunityDatasets/UPDATE',
  payload: dataset
})

export const setActiveOpportunityDataset = (datasetKey) => {
  setSearchParameter({opportunityDatasetId: datasetKey})
  return {
    type: 'opportunityDatasets/SET_ACTIVE',
    payload: datasetKey
  }
}

export const setOpportunityDatasets = (datasets) => ({
  type: 'opportunityDatasets/SET_ALL',
  payload: datasets
})

export const clearUploadStatus = (statusId) => ({
  type: 'opportunityDatasets/CLEAR_UPLOAD_STATUS',
  payload: statusId
})

export const updateUploadStatuses = (uploadStatuses) => ({
  type: 'opportunityDatasets/UPDATE_UPLOAD_STATUSES',
  payload: uploadStatuses
})

export const downloadLODES = (regionId) =>
  fetch({
    options: {
      method: 'POST'
    },
    url: `${OPP_URL}/region/${regionId}/download`,
    next: () => checkUploadStatus(regionId)
  })

export const loadOpportunityDatasets = (regionId) =>
  fetch({
    url: `${OPP_URL}/region/${regionId}`,
    next: (res) => setOpportunityDatasets(res.value)
  })

export const editOpportunityDataset = (dataset) =>
  fetch({
    url: `${OPP_URL}/${dataset._id}`,
    options: {
      body: omit(dataset, 'grid'),
      method: 'put'
    },
    next: (response) => updateOpportunityDataset(response.value)
  })

export const deleteOpportunityDataset = (dataset) =>
  fetch({
    url: `${OPP_URL}/${dataset._id}`,
    options: {
      method: 'delete'
    },
    next: () => removeOpportunityDataset(dataset)
  })

export const downloadOpportunityDataset = (dataset, format) =>
  fetch({
    url: `${OPP_URL}/${dataset._id}/${format}?redirect=false`
  })

export const loadOpportunityDataset = (dataset) => async (dispatch) => {
  // Set it before loading the next one so that it clears the grid.
  dispatch(setActiveOpportunityDataset(dataset._id))
  const binaryGrid = await dispatch(
    fetchSignedS3Url(`${OPP_URL}/${dataset._id}`)
  )
  const grid = createGrid(binaryGrid)

  dispatch(updateOpportunityDataset({...dataset, grid}))
  return grid
}

export const uploadOpportunityDataset = (body) =>
  fetch({
    url: OPP_URL,
    options: {
      body,
      method: 'post'
    },
    next: () => {
      const regionId = body.get('regionId')
      Router.push(pageToHref('opportunities', {regionId}))
      return checkUploadStatus(regionId)
    }
  })

export const checkUploadStatus = (regionId) =>
  fetch({
    url: `${OPP_URL}/region/${regionId}/status`,
    next: (response) => updateUploadStatuses(response.value)
  })

export const clearStatus = (regionId, statusId) => (dispatch) => {
  dispatch(clearUploadStatus(statusId))

  return dispatch(
    fetch({
      url: `${OPP_URL}/region/${regionId}/status/${statusId}`,
      options: {
        method: 'delete'
      }
    })
  )
}

export const deleteSourceSet = (sourceId) =>
  fetch({
    url: `${OPP_URL}/source/${sourceId}`,
    options: {
      method: 'delete'
    },
    next: (response) => response.value.map(removeOpportunityDataset)
  })
