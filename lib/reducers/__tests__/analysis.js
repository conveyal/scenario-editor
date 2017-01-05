/* globals describe, expect, it */

import { handleActions } from 'redux-actions'

import * as analysis from '../analysis'
import {mockScenarioApplicationError} from '../../utils/mock-data'

describe('reducers > analysis', () => {
  const rawReducer = handleActions(analysis.reducers, analysis.initialState)
  // wrap reducer in order to snapshot test the ever-changing date
  const reducer = (state, action) => {
    const outState = rawReducer(state, action)
    if (outState && outState.profileRequest && outState.profileRequest.date) {
      outState.profileRequest.date = '2016-12-20'
    }
    return outState
  }

  // Default State Test
  it('should handle default state', () => {
    expect(reducer(undefined, { type: 'blah', payload: {} })).toMatchSnapshot()
  })

  // Specific Handler Tests
  it('should handle set profile request', () => {
    const action = {
      type: 'set profile request',
      payload: {
        maxWalkTime: 20,
        fromTime: 24321,
        toTime: 25220
      }
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle clear isochrone results', () => {
    const action = { type: 'clear isochrone results', payload: {} }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set isochrone cutoff', () => {
    const action = { type: 'set isochrone cutoff', payload: 123 }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set isochrone fetch status', () => {
    const action = { type: 'set isochrone fetch status', payload: true }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set isochrone latlng', () => {
    const action = { type: 'set isochrone latlng', payload: 123 }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle show scenario application errors', () => {
    const action = { type: 'show scenario application errors', payload: [mockScenarioApplicationError] }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set isochrone results', () => {
    const action = {
      type: 'set isochrone results',
      payload: {
        isochrone: {},
        accessibility: 42,
        indicator: 'Jobs_total',
        grid: {},
        isochroneCutoff: 60,
        spectrogramData: ['SCENARIO'],
        comparisonAccessibility: 55,
        comparisonSpectrogramData: ['COMPARISON'],
        comparisonIsochrone: { comparison: true }
      }
    }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle enter analysis mode', () => {
    const action = { type: 'enter analysis mode' }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle exit analysis mode', () => {
    const action = { type: 'exit analysis mode' }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set active variant', () => {
    const action = {
      type: 'set active variant',
      payload: 21
    }
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set comparison in progress', () => {
    const action = {
      type: 'set comparison in progress',
      payload: true
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set comparison scenario', () => {
    const action = {
      type: 'set comparison scenario',
      payload: {
        id: 'COMPARISON SCENARIO ID',
        bundleId: 'COMPARISON BUNDLE ID',
        variantIndex: 16
      }
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set comparison modifications', () => {
    const action = {
      type: 'set comparison modifications',
      payload: {
        id: 'COMPARISON SCENARIO ID',
        bundleId: 'COMPARISON BUNDLE ID',
        variantIndex: 16,
        modifications: ['MODIFICATIONS']
      }
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set active regional analyses', () => {
    const action = {
      type: 'set active regional analyses',
      payload: {
        id: 'scenario id',
        comparisonId: 'comparison id'
      }
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set regional analysis grids', () => {
    const action = {
      type: 'set regional analysis grids',
      payload: {
        grid: { which: 'GRID' },
        comparisonGrid: { which: 'COMPARISON GRID' },
        differenceGrid: { which: 'DIFFERENCE_GRID' },
        probabilityGrid: { which: 'PROBABILITY GRID' }
      }
    }

    expect(reducer(undefined, action)).toMatchSnapshot()
  })
})
