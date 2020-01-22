import omit from 'lodash/omit'
import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import timeout from 'lib/utils/timeout'

import {setAggregationAreas} from './aggregation-areas'
import fetch from './fetch'
import {loadProjects} from './project'
import {loadProfileRequestSettings} from './analysis/profile-request'

import {loadBundles} from './'

const CHECK_STATUS_TIMEOUT = 10 * 1000

export const create = formData =>
  fetch({
    url: API.Region,
    options: {
      body: formData,
      method: 'post'
    },
    next: response => checkLoadStatus(response.value)
  })

export const save = region =>
  fetch({
    url: `${API.Region}/${region._id}`,
    options: {
      body: region,
      method: 'put'
    },
    next: response => checkLoadStatus(response.value)
  })

export const deleteLocally = createAction('delete region')
export const deleteRegion = _id =>
  fetch({
    options: {
      method: 'delete'
    },
    url: `${API.Region}/${_id}`,
    next: () => deleteLocally(_id)
  })

export const loadRegion = id =>
  fetch({
    url: `${API.Region}/${id}`,
    next: res => {
      const region = res.value
      // For legacy regions that were storing them in the region
      delete region.bundles
      delete region.projects

      // TODO: load bookmarks and aggregation areas separately
      const bookmarks = region.bookmarks
      const aggregationAreas = region.aggregationAreas
      delete region.bookmarks
      delete region.aggregationAreas

      return [
        setLocally(region),
        setBookmarks(bookmarks),
        setAggregationAreas(aggregationAreas)
      ]
    }
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

const checkLoadStatus = region => async dispatch => {
  if (region.statusCode === 'DONE') return dispatch(loadRegion(region._id))

  // Set locally
  dispatch(setLocally(region))
  if (region.statusCode === 'ERROR') return

  // Wait, then fetch and check again
  await timeout(CHECK_STATUS_TIMEOUT)

  return dispatch(
    fetch({
      url: `${API.Region}/${region._id}`,
      next: r => checkLoadStatus(r.value)
    })
  )
}

export const loadAll = () =>
  fetch({
    url: API.Region,
    next: response => setAll(response.value)
  })

export const setAll = createAction('set all regions')
export const setLocally = createAction('set region')

// Properties stored locally but not in a profile request on the backend
const omitIllegalBookmarkProps = pr =>
  omit(pr, ['comparisonProjectId', 'comparisonVariant'])

const createBookmarkLocally = createAction('create bookmark')
export const createBookmark = bookmark =>
  fetch({
    url: `${API.Region}/${bookmark.regionId}/bookmark`,
    options: {
      body: {
        ...bookmark,
        profileRequest: omitIllegalBookmarkProps(bookmark.profileRequest)
      },
      method: 'post'
    },
    next: response => createBookmarkLocally(response.value)
  })
const setBookmarks = createAction('set bookmarks')
