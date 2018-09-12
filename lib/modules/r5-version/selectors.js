// @flow
import filter from 'lodash/filter'
import flow from 'lodash/flow'
import sortBy from 'lodash/sortBy'
import {createSelector} from 'reselect'

import {
  MINIMUM_R5_VERSION,
  RELEASE_VERSION_REGEX
} from './constants'
import {initialState} from './reducer'
import {versionToNumber} from './utils'
import type {State} from './types'

type FullState = {
  r5Version: State
}

const MIN_VERSION_NUM = versionToNumber(MINIMUM_R5_VERSION)

/**
 * Use this to set the state key
 */
export const localState = (state: FullState) => state.r5Version || initialState()

export const analysisVersion =
  flow(localState, (state: State) => state.analysisVersion)
export const versions =
  flow(localState, (state: State) => state.versions)
export const currentR5Version =
  flow(localState, (state: State) => state.currentVersion)

/**
 * Get a sorted list of all the valid r5 versions
 */
export const allValidVersions = createSelector(
  versions,
  (versions) => sortBy(
    filter(versions, (version) => versionToNumber(version) >= MIN_VERSION_NUM),
    v => -versionToNumber(v) // sort descending
  )
)

/**
 * Filter out all non-release versions
 */
export const releaseVersions = createSelector(
  allValidVersions,
  (versions) => filter(versions, v => RELEASE_VERSION_REGEX.test(v))
)

/**
 * Is the current version out of date?
 */
export const newerVersionIsAvailable = createSelector(
  currentR5Version,
  releaseVersions,
  (current, releases) => releases.length > 0
    ? versionToNumber(current) < versionToNumber(releases[0])
    : false
)
