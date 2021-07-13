import fpGet from 'lodash/fp/get'
import {useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setRequestsSettings,
  updateRequestsSettings
} from 'lib/actions/analysis/profile-request'
import {PROFILE_REQUEST_DEFAULTS} from 'lib/constants'

const initialState = [PROFILE_REQUEST_DEFAULTS, PROFILE_REQUEST_DEFAULTS]

const getSettings = fpGet('analysis.requestsSettings')

/**
 * For the current region, get the request setting for the given index. Extracts it from
 * local storage by default.
 */
export default function useProfileRequest(index: number) {
  const dispatch = useDispatch()
  const settings: CL.ProfileRequest[] = useSelector(getSettings) ?? initialState
  const update = useCallback(
    (params: Partial<CL.ProfileRequest>) => {
      dispatch(updateRequestsSettings({index, params}))
    },
    [dispatch, index]
  )
  const replace = useCallback(
    (replacement: CL.ProfileRequest) => {
      const newSettings = [...settings]
      newSettings[index] = replacement
      dispatch(setRequestsSettings(newSettings))
    },
    [dispatch, index, settings]
  )

  return {settings: settings[index], replace, update}
}
