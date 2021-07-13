import {useEffect} from 'react'

import InnerDock from 'lib/components/inner-dock'
import {useShallowRouteTo} from 'lib/hooks/use-route-to'
import ActiveAnalysisPage from 'lib/regional/components/active-analysis-page'
import Heading from 'lib/regional/components/heading'
import ResultsPage from 'lib/regional/components/results-page'
import useRegionalAnalysis from 'lib/regional/hooks/use-regional-analysis'
import useRegionalJobs from 'lib/regional/hooks/use-regional-jobs'
import {
  getDefaultVariants,
  useVariant,
  variantIsCompatible
} from 'lib/regional/utils'
import withDataLayout from 'lib/hocs/with-data-layout'

export default withDataLayout<{
  analysis: CL.RegionalAnalysis
  jobs: CL.RegionalJob[]
}>(
  function Page(p) {
    const activeJob = p.jobs.find((j) => j.jobId === p.analysis._id)
    const routeTo = useShallowRouteTo('regionalAnalysis')

    // Construct the parsed query objects
    const analysisVariant: CL.RegionalAnalysisVariant = useVariant(
      p.analysis,
      parseInt(p.query.cutoff, 10),
      parseInt(p.query.percentile, 10),
      p.query.pointSetId
    )

    // Redirect to a valid variant if one has not been selected.
    useEffect(() => {
      if (
        analysisVariant.analysis != null &&
        !variantIsCompatible(analysisVariant)
      ) {
        routeTo(getDefaultVariants(analysisVariant.analysis))
      }
    }, [analysisVariant, routeTo])

    return (
      <InnerDock>
        <Heading analysis={p.analysis} />

        {activeJob ? (
          <ActiveAnalysisPage
            activeJob={activeJob}
            analysisVariant={analysisVariant}
          />
        ) : (
          <ResultsPage
            analysisVariant={analysisVariant}
            jobs={p.jobs}
            query={p.query}
          />
        )}
      </InnerDock>
    )
  },
  function useData(p) {
    return {
      analysis: useRegionalAnalysis(p.query.analysisId),
      jobs: useRegionalJobs(p.query.regionId)
    }
  }
)
