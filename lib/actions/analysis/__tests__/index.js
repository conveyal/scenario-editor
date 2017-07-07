/* global describe, expect, it */

import nock from 'nock'
import {mockScenarioApplicationError, createMockSurfaceData, mockSurfaceParameters, getMockSurfaceValue} from '../../../utils/mock-data'

describe('actions > analysis', () => {
  const analysis = require('../')

  it('clearIsochroneResults should work', () => {
    expect(analysis.clearIsochroneResults()).toMatchSnapshot()
  })

  it('setIsochroneCutoff should work', () => {
    expect(analysis.setIsochroneCutoff()).toMatchSnapshot()
  })

  it('setIsochroneFetchStatus should work', () => {
    expect(analysis.setIsochroneFetchStatus()).toMatchSnapshot()
  })

  it('setIsochroneLonLat should work', () => {
    expect(analysis.setIsochroneLonLat({ lon: 34, lat: 12 })).toMatchSnapshot()
  })

  it('setIsochroneResults should work', () => {
    expect(analysis.setIsochroneResults()).toMatchSnapshot()
  })

  it('setCurrentIndicator should work', () => {
    expect(analysis.setCurrentIndicator()).toMatchSnapshot()
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

  it('setComparisonScenarioId should work', () => {
    expect(analysis.setComparisonScenarioId()).toMatchSnapshot()
  })

  it('setComparisonModifications should work', () => {
    expect(analysis.setComparisonModifications()).toMatchSnapshot()
  })

  it('setProfileRequest should work', () => {
    expect(analysis.setProfileRequest({ maxWalkTime: 20 })).toMatchSnapshot()
  })

  it('setScenarioApplicationErrors should work', () => {
    expect(analysis.setScenarioApplicationErrors([mockScenarioApplicationError])).toMatchSnapshot()
  })

  it('setComparisonScenario should work', async (done) => {
    const mockModifications = [
      { name: 'MODIFICATION', variants: [false, true] },
      { name: 'MODIFICATION THAT SHOULD NOT BE IN RESULTS DUE TO VARIANT', variants: [true, false] }
    ]

    const nockHost = nock('http://mockhost.com')
    const nockMods = nockHost
      .get(/^\/api\/scenario\/COMPARISON_ID\/modifications$/)
      .reply(200, mockModifications)

    const [setId, [increment, fetchAction], nothing] = analysis.setComparisonScenario({
      id: 'COMPARISON_ID',
      bundleId: 'BUNDLE ID',
      variantIndex: 1
    })

    // this sets the comparison ID
    expect(setId).toMatchSnapshot()

    // incrementing outstanding requests
    expect(increment).toMatchSnapshot()

    // decrement and set modifications
    const [decrement, setMods] = await fetchAction
    expect(decrement).toMatchSnapshot()
    expect(await setMods).toMatchSnapshot()

    // this should be nothing, make sure there were no extra actions returned
    expect(nothing).toBe(undefined)

    expect(nockMods.isDone()).toBeTruthy()

    done()
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
    expect(surface.warnings[0]).toEqual(mockScenarioApplicationError)
    expect(surface.errors).toEqual([])
  })

  it('responseToSurface should decode errors', () => {
    // pass in a POJSO, will have been parsed from json by woonerf in actual practice
    const surface = analysis.responseToSurface([mockScenarioApplicationError])
    expect(surface.errors).toEqual([mockScenarioApplicationError])
    expect(surface.warnings).toEqual([])
  })
})
