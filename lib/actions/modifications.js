import fetch from '@conveyal/woonerf/fetch'
import {push} from 'react-router-redux'
import {createAction} from 'redux-actions'
import uuid from 'uuid'

import {lockUiWithError} from './'
import getFeedsRoutesAndStops from './get-feeds-routes-and-stops'
import {
  create as createModification,
  formatForServer,
  isValid
} from '../utils/modification'

export function copyFromScenario ({
  fromScenarioId,
  toScenarioId,
  variants
}) {
  return fetch({
    url: `/api/scenario/${fromScenarioId}/modifications`,
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }

      const modifications = response.value
      return modifications
        .map((modification) => {
          const newVariants = []

          for (let i = 0; i < variants.length; i++) {
            if (i < modification.variants.length) {
              newVariants.push(modification.variants[i])
            } else {
              newVariants.push(false)
            }
          }

          return set({
            ...modification,
            id: uuid.v4(),
            scenario: toScenarioId,
            variants: newVariants
          })
        })
    }
  })
}

export const create = ({
  feedId,
  projectId,
  scenarioId,
  type,
  variants
}) =>
  fetch({
    url: '/api/modification',
    options: {
      body: createModification({
        feedId,
        scenarioId,
        type,
        variants
      }),
      method: 'post'
    },
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }
      const modification = response.value
      return [
        setLocally(modification),
        push(`/projects/${projectId}/scenarios/${scenarioId}/modifications/${modification.id}`)
      ]
    }
  })

const deleteLocally = createAction('delete modification')
const deleteOnServer = (id) =>
  fetch({
    url: `/api/modification/${id}`,
    options: {
      method: 'delete'
    },
    next: (error) => error && lockUiWithError(error.value)
  })
export const deleteModification = (id) => [deleteLocally(id), deleteOnServer(id)]

export function getForScenario ({
  bundleId,
  scenarioId
}) {
  return fetch({
    url: `/api/scenario/${scenarioId}/modifications`,
    next (error, response) {
      if (error) {
        return lockUiWithError(error.value)
      }
      const modifications = response.value
      return [
        setAll(modifications),
        getFeedsRoutesAndStops({
          bundleId,
          modifications
        })
      ]
    }
  })
}

export const saveToServer = (m) =>
  fetch({
    url: `/api/modification/${m.id}`,
    options: {
      body: formatForServer(m),
      method: 'put'
    },
    next: (error) => error && lockUiWithError(error.value)
  })

export const set = (m) => [setLocally(m), saveToServer(m)]
export const setActive = createAction('set active modification')
const setAll = createAction('set modifications')
export const setAndRetrieveData = ({
  bundleId,
  modification
}) => (
    isValid(modification)
    ? [set(modification), getFeedsRoutesAndStops({bundleId, modifications: [modification]})]
    : [lockUiWithError('Modification is not valid after operation')]
)

export const setLocally = createAction('set modification')
