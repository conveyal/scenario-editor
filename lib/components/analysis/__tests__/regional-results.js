import {testComponent} from 'lib/utils/component'
import {mockStores, mockRegionalAnalyses} from 'lib/utils/mock-data'
import RegionalResults from '../regional-results'

const props = {
  analysis: mockRegionalAnalyses[0],
  opportunityDatasets: [{name: 'Total jobs', _id: 'Jobs_total'}],
  regionId: 'MOCK_REGION_ID'
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
    queryString: {
      ...mockStores.init.queryString,
      comparisonAnalysisId: mockRegionalAnalyses[1]._id
    }
  }
  const c = testComponent(RegionalResults, props, store)
  const t = c.mount()
  expect(t).toMatchSnapshot()
  t.unmount()
})
