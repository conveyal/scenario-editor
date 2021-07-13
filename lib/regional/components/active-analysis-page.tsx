import dynamic from 'next/dynamic'

import {useShallowRouteTo} from 'lib/hooks/use-route-to'

import ActiveJob from './active-job'
import RequestDisplay from './request'
import VariantSelectors from './variant-selectors'

const AnalysisBounds = dynamic(() => import('./analysis-bounds'), {ssr: false})

/**
 * View an active or completed regional analysis.
 */
export default function ActiveAnalysisPage({
  analysisVariant,
  activeJob
}: {
  analysisVariant: CL.RegionalAnalysisVariant
  activeJob: CL.RegionalJob
}) {
  const {analysis} = analysisVariant
  const routeTo = useShallowRouteTo('regionalAnalyses', {
    analysisId: analysis._id,
    regionId: analysis.regionId
  })

  return (
    <>
      <AnalysisBounds analysis={analysis} />

      <ActiveJob job={activeJob} />

      <VariantSelectors
        analysisVariant={analysisVariant}
        onChangeCutoff={(v) => routeTo({cutoff: v})}
        onChangePercentile={(v) => routeTo({percentile: v})}
        onChangePointSet={(v) => routeTo({pointSetId: v})}
      />

      <RequestDisplay analysis={analysis} />
    </>
  )
}
