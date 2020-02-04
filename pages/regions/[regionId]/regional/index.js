import {
  load,
  setActiveRegionalAnalysis,
  setComparisonRegionalAnalysis,
  setRegionalAnalysisDisplayCutoff
} from 'lib/actions/analysis/regional'
import {loadRegion} from 'lib/actions/region'
import RegionalResultsList from 'lib/components/analysis/regional-results-list'
import {loadOpportunityDatasets} from 'lib/modules/opportunity-datasets/actions'
import withInitialFetch from 'lib/with-initial-fetch'

async function initialFetch(store, query) {
  const [regionalAnalyses, opportunityDatasets] = await Promise.all([
    store.dispatch(load(query.regionId)),
    store.dispatch(loadOpportunityDatasets(query.regionId)),
    store.dispatch(loadRegion(query.regionId))
  ])

  // Set the store from the query parameters
  store.dispatch(setActiveRegionalAnalysis(query.analysisId))
  store.dispatch(setComparisonRegionalAnalysis(query.comparisonAnalysisId))
  store.dispatch(setRegionalAnalysisDisplayCutoff(query.cutoff))

  return {
    analysis: regionalAnalyses.find(a => a._id === query.analysisId),
    opportunityDatasets,
    regionalAnalyses
  }
}

export default withInitialFetch(RegionalResultsList, initialFetch)
