import {createAction} from 'redux-actions'

import {PROFILE_REQUEST_DEFAULTS} from 'lib/constants'
import R5Version from 'lib/modules/r5-version'
import selectCurrentRegionId from 'lib/selectors/current-region-id'
import {getParsedItem, stringifyAndSet} from 'lib/utils/local-storage'

/**
 * Save the profile request parameters to local storage
 */
export const setRequestsSettings = createAction('set requests settings')
export const updateRequestsSettings = createAction('update requests settings')
export const setResultsSettings = createAction('set results settings')
export const setCopyRequestSettings = createAction('set copy request settings')
export const clearComparisonSettings = createAction('clear comparison settings')

const requestsSettingsKey = 'profileRequestsSettings'
const getStoredSettings = () => {
  return getParsedItem(requestsSettingsKey) || {}
}

export const storeRequestsSettings = (requestsSettings) => (
  dispatch,
  getState
) => {
  const state = getState()
  const regionId = selectCurrentRegionId(state, {})

  try {
    const storedSettings = getStoredSettings()
    storedSettings[regionId] = requestsSettings
    stringifyAndSet(requestsSettingsKey, storedSettings)
  } catch (e) {
    console.error('Failed to store profile request settings locally.')
    console.error(e)
  }

  dispatch(setRequestsSettings(requestsSettings))
}

/**
 * Ovverides with default settings in case of missing parameters.
 */
export const loadRequestsSettings = (regionId) => {
  const storedRequestsSettings = getStoredSettings()
  const requestsSettings = storedRequestsSettings[regionId]
  if (requestsSettings) {
    return [
      setRequestsSettings([
        {
          ...PROFILE_REQUEST_DEFAULTS,
          ...requestsSettings[0]
        },
        {
          ...PROFILE_REQUEST_DEFAULTS,
          ...requestsSettings[1]
        }
      ]),
      R5Version.actions.setCurrentR5Version(requestsSettings[0].workerVersion)
    ]
  } else {
    return [
      setRequestsSettings([PROFILE_REQUEST_DEFAULTS, PROFILE_REQUEST_DEFAULTS]),
      R5Version.actions.setCurrentR5Version(R5Version.RECOMMENDED_R5_VERSION)
    ]
  }
}
