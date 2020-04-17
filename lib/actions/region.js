import {createAction} from 'redux-actions'

import {API} from 'lib/constants'

import fetch from './fetch'
import {loadProjects} from './project'
import {loadProfileRequestSettings} from './analysis/profile-request'

import {loadBundles} from './'

export const clear = createAction('clear current region')

export const create = formData =>
  fetch({
    url: API.Region,
    options: {
      body: formData,
      method: 'post'
    }
  })

export const save = region =>
  fetch({
    url: `${API.Region}/${region._id}`,
    options: {
      body: region,
      method: 'put'
    }
  })

export const deleteLocally = createAction('delete region')
export const deleteRegion = _id => dispatch => {
  dispatch(deleteLocally(_id))

  return dispatch(
    fetch({
      options: {
        method: 'delete'
      },
      url: `${API.Region}/${_id}`
    })
  )
}

export const loadRegion = id =>
  fetch({
    url: `${API.Region}/${id}`,
    next: res => setLocally(res.value)
  })

/**
 * Fully load a region and it's associated resources.
 */
export const load = id => async dispatch => {
  const [region, bundles, projects] = await Promise.all([
    dispatch(loadRegion(id)),
    dispatch(loadBundles({regionId: id})),
    dispatch(loadProjects({regionId: id}))
  ])

  // Load and set profile request
  dispatch(loadProfileRequestSettings(id))

  return {bundles, projects, region}
}

export const loadAll = () =>
  fetch({
    url: API.Region,
    next: response => setAll(response.value)
  })

export const setAll = createAction('set all regions')
export const setLocally = createAction('set region')
