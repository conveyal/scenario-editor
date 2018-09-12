// @flow
/** Actions for regional analysis */

import {createGrid} from 'browsochrones'
import {classifiers} from '@conveyal/gridualizer'
import fetch, {fetchMultiple} from '@conveyal/woonerf/fetch'
import sortBy from 'lodash/sortBy'
import {createAction} from 'redux-actions'
import {push} from 'react-router-redux'

import {PROFILE_REQUEST_DEFAULTS} from '../../constants'
import colors from '../../constants/colors'
import * as select from '../../selectors'
import {
  fetchMultipleSignedS3Urls,
  fetchSignedS3Url
} from '../../utils/fetch-signed-s3-url'
import {activeOpportunityDataset} from '../../modules/opportunity-datasets/selectors'
import R5Version from '../../modules/r5-version'
import type {LonLat} from '../../types'

import {storeProfileRequestSettings} from './'

const REGIONAL_URL = '/api/regional'

export const setRegionalAnalysis = createAction('set regional analysis')

export const setRegionalAnalyses = createAction('set regional analyses')

export const load = (regionId: string) =>
  fetch({
    url: `/api/region/${regionId}/regional`,
    next (response) {
      const analyses = sortBy(response.value, a => -a.createdAt) // newest at the top
      return setRegionalAnalyses(analyses)
    }
  })

export const setActiveRegionalAnalyses = createAction(
  'set active regional analyses'
)
export const setRegionalAnalysisGrids = createAction(
  'set regional analysis grids'
)
export const setMinimumImprovementProbability = createAction(
  'set minimum improvement probability'
)
const setRegionalAnalysisOriginLocally = createAction(
  'set regional analysis origin'
)
const setRegionalAnalysisSamplingDistribution = createAction(
  'set regional analysis sampling distribution'
)
const setComparisonRegionalAnalysisSamplingDistribution = createAction(
  'set comparison regional analysis sampling distribution'
)

/** This also does not add anything to the map */
export const loadRegionalAnalysisGrids = async ({
  _id,
  comparisonId
}: {
  _id: string,
  comparisonId: string
}) => {
  if (comparisonId) {
    return [
      setActiveRegionalAnalyses({
        _id,
        comparisonId
      }),
      fetchMultipleSignedS3Urls({
        urls: [
          `${REGIONAL_URL}/${_id}/grid/grid`,
          `${REGIONAL_URL}/${comparisonId}/grid/grid`,
          `${REGIONAL_URL}/${_id}/${comparisonId}/grid`
        ],
        next ([gridResponse, comparisonGridResponse, probabilityGridResponse]) {
          // TODO store raw data and create grids, classifier, breaks in selectors

          // Create the grids
          const comparisonGrid = createGrid(comparisonGridResponse.value)
          const grid = createGrid(gridResponse.value)
          const probabilityGrid = createGrid(probabilityGridResponse.value)

          // Create a difference grid
          const differenceGrid = subtract(grid, comparisonGrid)
          const classifier = classifiers.ckmeans({})
          const breaks = classifier(
            differenceGrid,
            colors.REGIONAL_COMPARISON_GRADIENT.length
          )

          return setRegionalAnalysisGrids({
            breaks,
            classifier,
            comparisonGrid,
            differenceGrid,
            grid,
            probabilityGrid
          })
        }
      })
    ]
  } else {
    return [
      setActiveRegionalAnalyses({_id, comparisonId}),
      fetchSignedS3Url({
        url: `${REGIONAL_URL}/${_id}/grid/grid`,
        next (response) {
          const gridData = response.value
          const grid = createGrid(gridData)
          const classifier = classifiers.ckmeans({})
          const breaks = classifier(grid, colors.REGIONAL_GRADIENT.length)
          return setRegionalAnalysisGrids({
            classifier,
            grid,
            breaks
          })
        }
      })
    ]
  }
}

export const createRegionalAnalysis = ({
  name,
  profileRequest
}: {
  name: string,
  profileRequest: any
}) => (dispatch: () => void, getState: () => any) => {
  const state = getState()
  const currentProjectId = select.currentProjectId(state, {})
  const currentRegionId = select.currentRegionId(state, {})
  const maxTripDurationMinutes = select.maxTripDurationMinutes(state)
  const opportunityDataset = activeOpportunityDataset(state, {})
  const workerVersion = R5Version.select.currentR5Version(state, {})

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

  dispatch(
    fetch({
      options: {
        method: 'POST',
        body: {
          ...finalProfileRequest,
          name,
          percentiles: [profileRequest.travelTimePercentile || 50]
        }
      },
      url: REGIONAL_URL,
      next: () => push(`/regions/${currentRegionId}/regional`)
    })
  )
}

const deleteRegionalAnalysisLocally = createAction('delete regional analysis')
export const deleteRegionalAnalysis = (analysisId: string) => [
  // run local delete first so it seems snappier. The worst that will happen is
  // that a regional analysis will pop back up in a few seconds when we refresh
  // regional analyses
  deleteRegionalAnalysisLocally(analysisId),
  fetch({
    url: `${REGIONAL_URL}/${analysisId}`,
    options: {
      method: 'DELETE'
    }
  })
]

const setAggregationAreaLocally = createAction('set aggregation area')
const setAggregationAreaId = createAction('set aggregation area id')
export const setAggregationArea = async (opts: void | {
  aggregationAreaId: string,
  regionId: string
}) => [
  setAggregationAreaId(opts && opts.aggregationAreaId),
  setAggregationAreaLocally(null), // clear existing so UI doesn't show results that don't match now-selected aggregation area
  opts && fetchSignedS3Url({
    url: `/api/region/${opts.regionId}/aggregationArea/${opts.aggregationAreaId}`,
    next: (res) => setAggregationAreaLocally(createGrid(res.value))
  })
]

const setAggregationAreaUploading = createAction(
  'set aggregation area uploading'
)
/** This triggers a reducer in region to inject the aggregation area into the current region */
const addAggregationAreaLocally = createAction('add aggregation area locally')

/** Upload an aggregation area */
export const uploadAggregationArea = ({
  name,
  files,
  regionId
}: {
  files: FileList,
  name: string,
  regionId: string
}) => {
  const formData = new window.FormData()
  formData.append('name', name)
  ;[...files].forEach(file => formData.append('files', file))

  return [
    setAggregationAreaUploading(true),
    fetch({
      url: `/api/region/${regionId}/aggregationArea`,
      options: {
        method: 'post',
        body: formData
      },
      next: (res) => [
        addAggregationAreaLocally(res.value),
        setAggregationAreaUploading(false)
      ]
    })
  ]
}

/**
 * Non-destructively subtract grid B from grid A
 */
function subtract (a, b) {
  const gridsDoNotAlign =
    a.west !== b.west ||
    a.north !== b.north ||
    a.zoom !== b.zoom ||
    a.width !== b.width ||
    a.height !== b.height

  if (gridsDoNotAlign) {
    throw new Error('Grids do not align for subtraction')
  }

  const {width, height} = a
  const newGrid = {
    ...a,
    data: new Int32Array(width * height),
    min: Infinity,
    max: -Infinity
  }

  for (let pixel = 0; pixel < width * height; pixel++) {
    const val = a.data[pixel] - b.data[pixel]
    newGrid.min = Math.min(newGrid.min, val)
    newGrid.max = Math.max(newGrid.max, val)
    newGrid.data[pixel] = val
  }

  return newGrid
}

export function downloadGridFromS3 (url: string) {
  return fetch({
    url,
    next: (err, response) => {
      if (err) window.alert(err)
      else window.open(response.url)
    }
  })
}

/**
 * Set the origin for showing a bootstrapped sampling distribution of travel
 * time.
 */
export const setRegionalAnalysisOrigin = (opts?: {
  comparisonRegionalAnalysisId: string,
  lonlat: LonLat,
  regionalAnalysisId: string
}) => {
  if (!opts) return setRegionalAnalysisOriginLocally(null)

  const getUrl = id =>
    `${REGIONAL_URL}/${id}/samplingDistribution/${ll.lat}/${ll.lon}`

  const ll = opts.lonlat
  const comparisonId = opts.comparisonRegionalAnalysisId
  const fetches = [{url: getUrl(opts.regionalAnalysisId)}]

  if (comparisonId) {
    fetches.push({url: getUrl(comparisonId)})
  }

  return fetchMultiple({
    fetches,
    next: (responses) => [
      setRegionalAnalysisOriginLocally(ll),
      setRegionalAnalysisSamplingDistribution(responses[0].value),
      setComparisonRegionalAnalysisSamplingDistribution(
        comparisonId ? responses[1].value : null
      )
    ]
  })
}

/**
 * Update a regional analysis
 */
export const updateRegionalAnalysis = (regionalAnalysis: any) =>
  fetch({
    options: {
      method: 'put',
      body: regionalAnalysis
    },
    url: `${REGIONAL_URL}/${regionalAnalysis._id}`,
    next: (response) =>
      setRegionalAnalysis(response.value)
  })
