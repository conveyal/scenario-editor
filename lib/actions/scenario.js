import fetch from '@conveyal/woonerf/fetch'
import {createAction} from 'redux-actions'
import {push} from 'react-router-redux'
import uuid from 'uuid'

import {lockUiWithError} from './'
import {getForScenario as getModificationsForScenario} from './modifications'

// scenario stuff
const addScenario = createAction('add scenario')
export const create = ({
  bundleId,
  name,
  projectId
}) =>
  fetch({
    url: '/api/scenario',
    options: {
      body: {
        bundleId,
        id: uuid.v4(),
        name,
        projectId,
        variants: ['Default']
      },
      method: 'post'
    },
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }

      const scenario = response.value
      return [
        addScenario(scenario),
        push(`/projects/${projectId}/scenarios/${scenario.id}`)
      ]
    }
  })

const deleteLocally = createAction('delete scenario')
export const deleteScenario = ({
  projectId,
  scenarioId
}) =>
  fetch({
    url: `/api/scenario/${scenarioId}`,
    options: {
      method: 'delete'
    },
    next: (error) => error
      ? lockUiWithError(error.value)
      : [deleteLocally(scenarioId), push(`/projects/${projectId}`)]
  })

export const load = (id) =>
  fetch({
    url: `/api/scenario/${id}`,
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }

      const scenario = response.value
      return [
        set(scenario),
        getModificationsForScenario({bundleId: scenario.bundleId, scenarioId: scenario.id})
      ]
    }
  })

export const saveToServer = (scenario) =>
  fetch({
    url: `/api/scenario/${scenario.id}`,
    options: {
      body: scenario,
      method: 'put'
    },
    next: (error, response) => error
      ? lockUiWithError(error.value)
      : set(response.value)
  })
export const set = createAction('set scenario')
export const setAll = createAction('set scenarios')

export const setAndLoadModifications = (scenario) => [
  set(scenario),
  getModificationsForScenario({
    bundleId: scenario.bundleId,
    scenarioId: scenario.id
  })
]

/** update available variants */
export const createVariant = createAction('create variant')
export const showVariant = createAction('show variant')
export const updateVariant = createAction('update variant')
export const updateVariants = createAction('update variants')
