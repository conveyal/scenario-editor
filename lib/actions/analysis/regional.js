/** Actions for regional analysis */
import sortBy from 'lodash/sortBy'
import Router from 'next/router'
import {createAction} from 'redux-actions'

import {API, PROFILE_REQUEST_DEFAULTS} from 'lib/constants'
import {routeTo} from 'lib/router'
import * as select from 'lib/selectors'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import R5Version from 'lib/modules/r5-version'
import createGrid from 'lib/utils/create-grid'
import setSearchParameter from 'lib/utils/set-search-parameter'

import fetch from '../fetch'
import fetchSignedS3Url from '../fetch-signed-s3-url'

import {storeProfileRequestSettings} from './profile-request'

const REGION_URL = API.Region
const REGIONAL_URL = API.Regional

export const setRegionalAnalysis = createAction('set regional analysis')

export const setRegionalAnalyses = createAction('set regional analyses')

export const load = regionId =>
  fetch({
    url: `${REGION_URL}/${regionId}/regional`,
    next(response) {
      const analyses = sortBy(response.value, a => -a.createdAt) // newest at the top
      return [
        setRegionalAnalyses(analyses),
        R5Version.actions.setUsedVersions(
          analyses.map(a => ({
            name: a.name,
            version: a.workerVersion
          }))
        )
      ]
    }
  })

export const setActiveRegionalAnalyses = createAction(
  'set active regional analyses'
)
export const setActiveRegionalAnalysis = createAction(
  'set active regional analysis',
  function(id) {
    setSearchParameter('analysisId', id)
    return id
  }
)
export const setComparisonRegionalAnalysis = createAction(
  'set comparison regional analysis',
  function(id) {
    setSearchParameter('comparisonAnalysisId', id)
    return id
  }
)
export const setRegionalAnalysisGrid = createAction(
  'set regional analysis grid'
)
const setRegionalAnalysisOriginLocally = createAction(
  'set regional analysis origin'
)

export const loadRegionalAnalysisGrid = _id => async (dispatch, getState) => {
  const grids = getState().regionalAnalyses.grids

  if (!grids.find(g => g._id === _id)) {
    const rawGrid = await dispatch(
      fetchSignedS3Url(`${REGIONAL_URL}/${_id}/grid/grid`)
    )
    // Parse the headers and create a usable grid.
    const grid = createGrid(rawGrid)
    // Assign the regional _id
    grid._id = _id
    // Pass into the store
    dispatch(setRegionalAnalysisGrid(grid))
  }
}

export const createRegionalAnalysis = ({name, profileRequest}) => async (
  dispatch,
  getState
) => {
  const state = getState()
  const currentProjectId = select.currentProjectId(state, {})
  const currentRegionId = select.currentRegionId(state, {})
  const maxTripDurationMinutes = select.maxTripDurationMinutes(state)
  const opportunityDataset = activeOpportunityDataset(state, {})
  const workerVersion = R5Version.select.currentVersion(state, {})

  if (!opportunityDataset || !opportunityDataset._id) {
    window.alert('Opportunity dataset must be selected.')
    return
  }

  const finalProfileRequest = {
    ...PROFILE_REQUEST_DEFAULTS,
    ...profileRequest,
    maxTripDurationMinutes,
    opportunityDatasetId: opportunityDataset._id,
    projectId: currentProjectId,
    workerVersion
  }

  // Store the profile request settings for the user/region
  dispatch(storeProfileRequestSettings(profileRequest))

  const createResult = await dispatch(
    fetch({
      options: {
        method: 'POST',
        body: {
          ...finalProfileRequest,
          name,
          percentiles: [profileRequest.travelTimePercentile || 50]
        }
      },
      url: REGIONAL_URL
    })
  )

  const {as, href} = routeTo('regionalAnalyses', {regionId: currentRegionId})
  Router.push(href, as)

  return createResult
}

const deleteRegionalAnalysisLocally = createAction('delete regional analysis')
export const deleteRegionalAnalysis = analysisId => dispatch => {
  // Run local delete first so it seems snappier. The worst that will happen is
  // that a regional analysis will pop back up in a few seconds when we refresh
  // regional analyses.
  dispatch(deleteRegionalAnalysisLocally(analysisId))

  return dispatch(
    fetch({
      url: `${REGIONAL_URL}/${analysisId}`,
      options: {
        method: 'DELETE'
      }
    })
  )
}

export function downloadGridFromS3(url) {
  return fetch({
    url,
    next: (err, response) => {
      if (err) window.alert(err)
      else window.open(response.url)
    }
  })
}

/**
 * NB: THIS FUNCTIONALITY IS CURRENTLY DISABLED.
 *
 * Set the origin for showing a bootstrapped sampling distribution of travel
 * time.
 */
export const setRegionalAnalysisOrigin = opts => {
  if (!opts) return setRegionalAnalysisOriginLocally(null)
  else return setRegionalAnalysisOriginLocally(opts.lonlat)
}

/**
 * Update a regional analysis
 */
export const updateRegionalAnalysis = regionalAnalysis =>
  fetch({
    options: {
      method: 'put',
      body: regionalAnalysis
    },
    url: `${REGIONAL_URL}/${regionalAnalysis._id}`,
    next: response => setRegionalAnalysis(response.value)
  })
