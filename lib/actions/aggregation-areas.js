import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import createGrid from 'lib/utils/create-grid'

import fetch from './fetch'
import fetchSignedS3Url from './fetch-signed-s3-url'

const REGION_URL = API.Region

export const addAggregationAreaLocally = createAction(
  'add aggregation area locally'
)
export const setAggregationAreas = createAction('set aggregation areas')
export const setActiveAggregationArea = createAction(
  'set active aggregation area'
)

export const setAggregationArea = aa => async dispatch => {
  dispatch(setActiveAggregationArea(aa))

  const rawGrid = await dispatch(
    fetchSignedS3Url(`${REGION_URL}/${aa.regionId}/aggregationArea/${aa._id}`)
  )
  const grid = createGrid(rawGrid)
  dispatch(setActiveAggregationArea({...aa, grid}))

  return grid
}

/** Upload an aggregation area */
export const uploadAggregationArea = (formData, regionId) =>
  fetch({
    url: `${REGION_URL}/${regionId}/aggregationArea`,
    type: 'aggregation-area-upload',
    options: {
      method: 'post',
      body: formData
    },
    next: res => {
      const newAgAreas = res.value
      return newAgAreas.map(aa => addAggregationAreaLocally(aa))
    }
  })
