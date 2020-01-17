import {testComponent} from 'lib/utils/component'
import {mockStores, mockGrid, mockRegionalAnalyses} from 'lib/utils/mock-data'
import RegionalResults from '../regional-results'

const props = {
  analysis: mockRegionalAnalyses[0],
  analysisId: mockRegionalAnalyses[0]._id,
  breaks: [100, 500, 1000, 2000],
  opportunityDatasets: [{name: 'Total jobs', _id: 'Jobs_total'}],
  regionId: 'MOCK_REGION_ID',
  grid: mockGrid
}

test('RegionalResults snapshot(mount)', () => {
  const c = testComponent(RegionalResults, props)
  const t = c.mount()
  expect(t).toMatchSnapshot()
  t.unmount()
})

test('RegionalResults with comparison snapshot(mount)', () => {
  const store = {
    ...mockStores.init,
    analysis: {
      ...mockStores.init.analysis,
      regional: {
        ...mockStores.init.analysis.regional,
        comparisonId: mockRegionalAnalyses[1]._id
      }
    }
  }
  const c = testComponent(RegionalResults, props, store)
  const t = c.mount()
  expect(t).toMatchSnapshot()
  t.unmount()
})
