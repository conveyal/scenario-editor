// @flow

import * as analysis from '../'
import {
  mockProjectApplicationError,
  createMockSurfaceData,
  mockSurfaceParameters,
  getMockSurfaceValue
} from '../../../utils/mock-data'

describe('actions > analysis', () => {
  it('setIsochroneCutoff should work', () => {
    expect(analysis.setIsochroneCutoff()).toMatchSnapshot()
  })

  it('setIsochroneFetchStatus should work', () => {
    expect(analysis.setIsochroneFetchStatus()).toMatchSnapshot()
  })

  it('setIsochroneLonLat should work', () => {
    expect(analysis.setIsochroneLonLat({lon: 34, lat: 12})).toMatchSnapshot()
  })

  it('setIsochroneResults should work', () => {
    expect(analysis.setIsochroneResults()).toMatchSnapshot()
  })

  it('enterAnalysisMode should work', () => {
    expect(analysis.enterAnalysisMode()).toMatchSnapshot()
  })

  it('exitAnalysisMode should work', () => {
    expect(analysis.exitAnalysisMode()).toMatchSnapshot()
  })

  it('setActiveVariant should work', () => {
    expect(analysis.setActiveVariant()).toMatchSnapshot()
  })

  it('setComparisonProject should work', () => {
    expect(analysis.setComparisonProject({
      _id: 'COMPARISON_ID',
      bundleId: 'BUNDLE ID',
      variantIndex: 1
    })).toMatchSnapshot()
  })

  it('setProfileRequest should work', () => {
    expect(analysis.setProfileRequest({maxRides: 20})).toMatchSnapshot()
  })

  it('setProjectApplicationErrors should work', () => {
    expect(
      analysis.setProjectApplicationErrors([mockProjectApplicationError])
    ).toMatchSnapshot()
  })

  it('responseToSurface should decode surface', () => {
    const surface = analysis.responseToSurface(createMockSurfaceData())
    expect(surface.zoom).toBe(mockSurfaceParameters.zoom)
    expect(surface.west).toBe(mockSurfaceParameters.west)
    expect(surface.north).toBe(mockSurfaceParameters.north)
    expect(surface.width).toBe(mockSurfaceParameters.width)
    expect(surface.height).toBe(mockSurfaceParameters.height)
    expect(surface.nSamples).toBe(mockSurfaceParameters.nSamples)

    for (let y = 0; y < surface.height; y++) {
      for (let x = 0; x < surface.width; x++) {
        const samplesThisPixel = surface.get(x, y)
        for (let z = 0; z < surface.nSamples; z++) {
          // should have been de-delta-coded already
          expect(samplesThisPixel[z]).toBe(getMockSurfaceValue(x, y, z))
        }
      }
    }

    expect(surface.warnings.length).toBe(1)
    expect(surface.warnings[0]).toEqual(mockProjectApplicationError)
    expect(surface.errors).toEqual([])
  })

  it('responseToSurface should decode errors', () => {
    // pass in a POJSO, will have been parsed from json by woonerf in actual practice
    const surface = analysis.responseToSurface([mockProjectApplicationError])
    expect(surface.errors).toEqual([mockProjectApplicationError])
    expect(surface.warnings).toEqual([])
  })
})
