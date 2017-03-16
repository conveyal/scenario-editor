import fetch from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'
import {push} from 'react-router-redux'
import uuid from 'uuid'

import {lockUiWithError, setBundles} from './'
import {setCenter as setMapCenter} from './map'
import {setAll as setScenarios} from './scenario'
import {clear as clearBrowsochrones} from '../utils/browsochrones'

export const create = (project) => {
  project.id = uuid.v4()
  return fetch({
    url: '/api/project',
    options: {
      body: project,
      method: 'post'
    },
    next: (error, response) => error
      ? lockUiWithError(error.value)
      : [setLocally(project), push(`/projects/${project.id}`)]
  })
}

export const deleteLocally = createAction('delete project')
export const deleteProject = (id) =>
  fetch({
    options: {
      method: 'delete'
    },
    url: `/api/project/${id}`,
    next: (error) => error
      ? lockUiWithError(error.value)
      : [deleteLocally(id), push('/')]
  })

export const load = (id) =>
  fetch({
    url: `/api/project/${id}`,
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }

      const project = response.value
      return [
        clearBrowsochrones(),
        setLocally({...project, bundles: [], scenarios: []}),
        setMapCenter([(project.bounds.west + project.bounds.east) / 2, (project.bounds.north + project.bounds.south) / 2]),
        setBundles(project.bundles),
        setScenarios(project.scenarios)
      ]
    }
  })

export const loadAll = () =>
  fetch({
    url: '/api/project',
    next: (error, response) => error
      ? lockUiWithError(error.value)
      : setAll(response.value)
  })

export const save = (project) => [setLocally(project), saveToServer(project)]
const saveToServer = (project) =>
  fetch({
    url: `/api/project/${project.id}`,
    options: {
      body: project,
      method: 'put'
    },
    next: (error) => error && lockUiWithError(error.value)
  })

export const setAll = createAction('set all projects')
export const setLocally = createAction('set project')
