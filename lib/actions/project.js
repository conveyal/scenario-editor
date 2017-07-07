import fetch from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'
import {push} from 'react-router-redux'
import uuid from 'uuid'

import {setBundles} from './'
import {setCurrentIndicator} from './analysis'
import {setCenter as setMapCenter} from './map'
import {setAll as setScenarios} from './scenario'
import timeout from '../utils/timeout'

const saveToServer = ({customOpenStreetMapData, ...project}, method) => {
  const formData = new window.FormData()
  formData.append('project', JSON.stringify(project))
  if (customOpenStreetMapData) formData.append('customOpenStreetMapData', customOpenStreetMapData)

  return fetch({
    url: method.toLowerCase() === 'put' ? `/api/project/${project.id}` : '/api/project',
    options: {
      body: formData,
      method
    },
    next: (error, response) => !error && [
      setLocally(response.value),
      awaitLoad(response.value.id, () => push(`/projects/${response.value.id}`))
    ]
  })
}

export const create = (project) => {
  project.id = uuid.v4()
  return saveToServer(project, 'post')
}

// TODO why is there a call to setLocally when saving but not when creating (this behavior was
// preserved during my refactor - MWC)
export const save = (project) => [setLocally(project), saveToServer(project, 'put')]

export const deleteLocally = createAction('delete project')
export const deleteProject = (id) =>
  fetch({
    options: {
      method: 'delete'
    },
    url: `/api/project/${id}`,
    next: (error) => !error && [deleteLocally(id), push('/')]
  })

export const load = (id) =>
  fetch({
    url: `/api/project/${id}`,
    next (error, response) {
      if (!error) {
        const project = response.value
        return [
          setLocally({...project, bundles: [], scenarios: []}),
          setMapCenter([(project.bounds.west + project.bounds.east) / 2, (project.bounds.north + project.bounds.south) / 2]),
          setBundles(project.bundles),
          setScenarios(project.scenarios)
        ]
      }
    }
  })

export const awaitLoad = (id, next) =>
  fetch({
    url: `/api/project/${id}`,
    next (err, response) {
      if (!err) {
        if (response.value.loadStatus !== 'DONE') {
          return [
            setLocally(response.value),
            timeout(5000).then(() => awaitLoad(id, next))
          ]
        } else return [setLocally(response.value), next()]
      }
    }
  })

export const loadAll = () =>
  fetch({
    url: '/api/project',
    next: (error, response) => !error && setAll(response.value)
  })

const setProjectLocally = createAction('set project')

export const setAll = createAction('set all projects')
export const setLocally = (project) => {
  let indicator = null
  if (project.indicators != null && project.indicators.length > 0) {
    if (project.indicators.find(i => i.key === 'Jobs_total')) indicator = 'Jobs_total'
    else indicator = project.indicators[0].key
    return [setProjectLocally(project), setCurrentIndicator(project.id, indicator)]
  } else {
    return setProjectLocally(project)
  }
}

const createBookmarkLocally = createAction('create bookmark')
export const createBookmark = (bookmark) => [
  createBookmarkLocally(bookmark),
  fetch({
    url: `/api/project/${bookmark.projectId}/bookmark`,
    options: {
      body: bookmark,
      method: 'post'
    },
    next () {}
  })
]
