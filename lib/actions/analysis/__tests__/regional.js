import nock from 'nock'

import {makeMockStore, mockRegionalAnalyses} from 'lib/utils/mock-data'

import * as regional from '../regional'

describe('Actions > Analysis > Regional', () => {
  it('setRegionalAnalyses should work', () => {
    expect(regional.setRegionalAnalyses(mockRegionalAnalyses)).toMatchSnapshot()
  })

  it('setActiveRegionalAnalyses should work', () => {
    expect(regional.setActiveRegionalAnalyses()).toMatchSnapshot()
  })

  it('deleteRegionalAnalysis should work', () => {
    const store = makeMockStore()
    const nockHost = nock('http://localhost')
      .delete('/api/regional/12321a')
      .reply(200, 'deleted')

    return store
      .dispatch(regional.deleteRegionalAnalysis('12321a'))
      .then(() => {
        expect(nockHost.isDone()).toBeTruthy()
      })
  })

  // TODO loadRegionalAnalysisGrids, runAnalysis, deleteRegionalAnalysis
})
