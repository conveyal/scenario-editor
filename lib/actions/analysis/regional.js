/** Actions for regional analysis */
import sortBy from 'lodash/sortBy'
import Router from 'next/router'
import {createAction} from 'redux-actions'

import {API, PROFILE_REQUEST_DEFAULTS} from 'lib/constants'
import fetch from 'lib/fetch-action'
import {routeTo} from 'lib/router'
import * as select from 'lib/selectors'
import {fetchSignedS3Url} from 'lib/utils/fetch-signed-s3-url'
import {activeOpportunityDataset} from 'lib/modules/opportunity-datasets/selectors'
import R5Version from 'lib/modules/r5-version'
import createGrid from 'lib/utils/create-grid'

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
export const setRegionalAnalysisGrids = createAction(
  'set regional analysis grids'
)
const setRegionalAnalysisOriginLocally = createAction(
  'set regional analysis origin'
)

/**
 * This also does not add anything to the map.
 */
export const loadRegionalAnalysisGrids = ({
  _id,
  comparisonId
}) => async dispatch => {
  const results = {}
  dispatch(setActiveRegionalAnalyses({_id, comparisonId}))

  const rawGrid = await dispatch(
    fetchSignedS3Url(`${REGIONAL_URL}/${_id}/grid/grid`)
  )

  results.grid = createGrid(rawGrid)

  if (comparisonId) {
    const rawComparisonGrid = await dispatch(
      fetchSignedS3Url(`${REGIONAL_URL}/${comparisonId}/grid/grid`)
    )

    // Create the grids
    results.comparisonGrid = createGrid(rawComparisonGrid)
  }

  dispatch(setRegionalAnalysisGrids(results))
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
