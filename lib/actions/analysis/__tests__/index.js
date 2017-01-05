/* global describe, expect, it */

import nock from 'nock'
import {mockScenarioApplicationError} from '../../../utils/mock-data'

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

  it('setIsochroneLatLng should work', () => {
    expect(analysis.setIsochroneLatLng({ lat: 12, lon: 34 })).toMatchSnapshot()
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

  it('setComparisonInProgress should work', () => {
    expect(analysis.setComparisonInProgress()).toMatchSnapshot()
  })

  it('setProfileRequest should work', () => {
    expect(analysis.setProfileRequest({ maxWalkTime: 20 })).toMatchSnapshot()
  })

  it('showScenarioApplicationErrors should work', () => {
    expect(analysis.showScenarioApplicationErrors([mockScenarioApplicationError])).toMatchSnapshot()
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
    console.log(`set mods: ${setMods}`)
    expect(await setMods).toMatchSnapshot()
    console.log('done')

    // this should be nothing, make sure there were no extra actions returned
    expect(nothing).toBe(undefined)

    expect(nockMods.isDone()).toBeTruthy()

    done()
  })

  /* Not sure how this thing works
  it('fetchIsochrone should work', (done) => {
    const actionArgs = {
      scenarioId: '1',
      bundleId: '1',
      modifications: [],
      isochroneCutoff: 1,
      origin: 1
    }
    setGrids([])
    const actionResults = analysis.fetchIsochrone(actionArgs)
    expect(actionResults.slice(0, 2)).toMatchSnapshot()
    console.log(actionResults[2])
    actionResults[2].then((result) => {
      console.log('resolved')
      expect(result).toMatchSnapshot()
      done()
    })
  })
  */
})
