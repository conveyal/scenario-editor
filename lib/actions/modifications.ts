import {createAction} from 'redux-actions'

import {API} from 'lib/constants'
import selectBundleId from '../selectors/bundle-id'
import {
  create as populateModificationType,
  formatForServer,
  isValid
} from '../utils/modification'

import fetch, {fetchMultiple} from './fetch'
import getFeedsRoutesAndStops from './get-feeds-routes-and-stops'

const MODIFICATION_URL = API.Modification
const PROJECT_URL = API.Project

/**
 * POST the modification to `/api/modification/${_id}/copy`
 */
export function copy(_id) {
  return fetch({
    url: `${MODIFICATION_URL}/${_id}/copy`,
    options: {
      method: 'post'
    },
    next: (response) => ({
      type: 'create modification',
      payload: response.value
    })
  })
}

/**
 * Load a single modification.
 */
export const loadModification = (_id) => async (dispatch) => {
  dispatch(setActive(_id))

  const modification = await dispatch(
    fetch({
      url: `${MODIFICATION_URL}/${_id}`
    })
  )

  dispatch(setLocally(modification))

  return modification
}

/**
 * POST to `/api/project/${_id}/import/${importFromId}`
 */
export const copyFromProject = ({fromProjectId, toProjectId}) =>
  fetch({
    url: `${PROJECT_URL}/${toProjectId}/import/${fromProjectId}`,
    options: {
      method: 'post'
    },
    next: (r) => ({type: 'create modifications', payload: r.value})
  })

/**
 * Populate the modification based on type and POST to the server. Send a
 * create action on completion and return the modification.
 *
 * @returns Promise
 */
export const createModification = (body) =>
  fetch({
    url: MODIFICATION_URL,
    options: {
      body: populateModificationType(body),
      method: 'post'
    },
    next: (response) => ({
      type: 'create modification',
      payload: response.value
    })
  })

/**
 * Create multiple modifications.
 */
export const createMultiple = (modifications) =>
  fetchMultiple({
    fetches: modifications.map((m) => ({
      url: MODIFICATION_URL,
      options: {
        body: m,
        method: 'post'
      }
    })),
    next: (response) => ({
      type: 'create modifications',
      payload: response.value
    })
  })

export const updateModification = (modification) => (dispatch, getState) => {
  const state = getState()
  const bundleId = selectBundleId(state)

  if (!isValid(modification)) {
    window.alert('Modification is not valid after edit.')
    return
  }

  dispatch(setLocally(modification))

  return Promise.all([
    dispatch(saveToServer(modification)),
    dispatch(getFeedsRoutesAndStops({bundleId, modifications: [modification]}))
  ])
}

const deleteLocally = createAction('delete modification')
const deleteOnServer = (_id) =>
  fetch({
    url: `${MODIFICATION_URL}/${_id}`,
    options: {
      method: 'delete'
    }
  })
export const deleteModification = (_id) => (dispatch, getState) => {
  const {project} = getState()
  const modifications = project ? project.modifications : []

  // Eagerly delete, any serious errors would cause a page reload anyway.
  dispatch(deleteLocally(_id))

  return Promise.all([
    dispatch(deleteOnServer(_id)),
    dispatch(clearReferencesToModification({_id, modifications}))
  ])
}

export const getForProject = (projectId) =>
  fetch({
    url: `${PROJECT_URL}/${projectId}/modifications`,
    next: (r) => setAll(r.value)
  })

const updateLocally = createAction('update modification')
export const saveToServer = (m) =>
  fetch({
    type: `put ${m._id}`,
    url: `${MODIFICATION_URL}/${m._id}`,
    options: {
      body: formatForServer(m),
      method: 'put'
    },
    next: (response) =>
      updateLocally({
        _id: m._id,
        nonce: response.value.nonce // Needed to update the `nonce`
      })
  })

export const setActive = createAction('set active modification')
export const setAll = createAction('set modifications')
export const setLocally = createAction('set modification')

/**
 * When deleting a modification it might have been referenced from other
 * modifications. Ensure that those references are cleared.
 */
export const clearReferencesToModification = ({_id, modifications}) => (
  dispatch
) => {
  const timetableMatches = (tt) =>
    tt.phaseFromTimetable && tt.phaseFromTimetable.split(':')[0] === _id
  const referencesModification = (tts) =>
    tts && tts.length > 0 && !!tts.find(timetableMatches)
  const clearTimetableReferences = (tt) =>
    timetableMatches(tt)
      ? {...tt, phaseFromTimetable: null, phaseFromStop: null}
      : tt

  return Promise.all(
    modifications
      .filter((m) => referencesModification(m.entries || m.timetables))
      .map((m) =>
        m.entries
          ? dispatch(
              saveToServer({
                ...m,
                entries: m.entries.map(clearTimetableReferences)
              })
            )
          : dispatch(
              saveToServer({
                ...m,
                timetables: m.timetables.map(clearTimetableReferences)
              })
            )
      )
  )
}
