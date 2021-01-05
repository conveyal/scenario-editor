/** Actions for regional analysis */
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'
import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import R5Version from 'lib/modules/r5-version'
import createGrid from 'lib/utils/create-grid'
import predictJobTimeRemaining from 'lib/utils/predict-job-time-remaining'

import fetch from '../fetch'
import fetchSignedS3Url from '../fetch-signed-s3-url'

const REGION_URL = API.Region
const REGIONAL_URL = API.Regional

export const setRegionalAnalysis = createAction('set regional analysis')
export const setRegionalAnalyses = createAction('set regional analyses')
export const setActiveRegionalJobs = createAction('set active regional jobs')

export const load = (regionId) =>
  fetch({
    url: `${REGION_URL}/${regionId}/regional`,
    next(response) {
      const analyses = sortBy(response.value, (a) => -a.createdAt) // newest at the top
      return [
        setRegionalAnalyses(analyses),
        R5Version.actions.setUsedVersions(
          analyses.map((a) => ({
            name: a.name,
            version: a.workerVersion
          }))
        )
      ]
    }
  })

// Show time if...at least one task is complete AND either the regional analysis
// was created more than five minutes ago or there is more than one acitve worker.
function getJobStatus(job) {
  if (job.complete === job.total) return 'assembling results...'
  if (job.complete === 0) return 'starting cluster...'
  return predictJobTimeRemaining(job)
}

export const loadActiveRegionalJobs = (regionId) =>
  fetch({
    url: `${REGION_URL}/${regionId}/regional/running`,
    next: (res) =>
      setActiveRegionalJobs(
        (res.value || []).map((j) => ({
          ...j,
          statusText: getJobStatus(j)
        }))
      )
  })

export const setActiveRegionalAnalyses = createAction(
  'set active regional analyses'
)
export const setRegionalAnalysisGrid = createAction(
  'set regional analysis grid'
)
const setRegionalAnalysisOriginLocally = createAction(
  'set regional analysis origin'
)

export const loadRegionalAnalysisGrid = (
  analysis,
  cutoff,
  percentile,
  pointSetId
) => async (dispatch, getState) => {
  const {grids} = getState().regionalAnalyses

  // Check if the analysis needs a cutoff and percentile
  const hasMultiCutoff =
    Array.isArray(analysis.cutoffsMinutes) &&
    Array.isArray(analysis.travelTimePercentiles)
  if (
    hasMultiCutoff &&
    (!Number.isInteger(cutoff) || !Number.isInteger(percentile))
  ) {
    console.error(
      'Multi-dimensional analysis needs cutoff and percentile',
      cutoff,
      percentile
    )
    return
  }

  if (
    !grids.find(
      (g) =>
        g.analysisId === analysis._id &&
        g.cutoff === cutoff &&
        g.percentile === percentile &&
        g.pointSetId === pointSetId
    )
  ) {
    const rawGrid = await dispatch(
      fetchSignedS3Url(
        `${REGIONAL_URL}/${analysis._id}/grid/grid?cutoff=${cutoff}&percentile=${percentile}&destinationPointSetId=${pointSetId}`
      )
    )

    // Pass into the store
    dispatch(
      setRegionalAnalysisGrid({
        // Parse the headers and create a usable grid.
        ...createGrid(rawGrid),
        // Assign the regional analysis _id and display parameters
        analysisId: analysis._id,
        cutoff: cutoff || get(analysis, 'cutoffMinutes'),
        percentile: percentile || get(analysis, 'travelTimePercentile'),
        pointSetId
      })
    )
  }
}

export const createRegionalAnalysis = (settings) =>
  fetch({
    options: {method: 'POST', body: settings},
    url: REGIONAL_URL
  })

const deleteRegionalAnalysisLocally = createAction('delete regional analysis')
export const deleteRegionalAnalysis = (analysisId) => (dispatch) => {
  // Run local delete first so it seems snappier. The worst that will happen is
  // that a regional analysis will pop back up in a few seconds when we refresh
  // regional analyses.
  dispatch(deleteRegionalAnalysisLocally(analysisId))

  return dispatch(
    fetch({
      url: `${REGIONAL_URL}/${analysisId}`,
      options: {
        method: 'DELETE'
      },
      next: () => deleteRegionalAnalysisLocally(analysisId)
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
export const setRegionalAnalysisOrigin = (opts) => {
  if (!opts) return setRegionalAnalysisOriginLocally(null)
  else return setRegionalAnalysisOriginLocally(opts.lonlat)
}

/**
 * Update a regional analysis
 */
export const updateRegionalAnalysis = (regionalAnalysis) =>
  fetch({
    options: {
      method: 'put',
      body: regionalAnalysis
    },
    url: `${REGIONAL_URL}/${regionalAnalysis._id}`,
    next: (response) => setRegionalAnalysis(response.value)
  })
