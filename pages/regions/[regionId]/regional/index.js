import {faServer} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {
  deleteRegionalAnalysis,
  load as loadAllAnalyses
} from 'lib/actions/analysis/regional'
import {loadRegion} from 'lib/actions/region'
import Icon from 'lib/components/icon'
import InnerDock from 'lib/components/inner-dock'
import Regional from 'lib/components/analysis/regional'
import Selector from 'lib/components/analysis/regional-analysis-selector'
import useInterval from 'lib/hooks/use-interval'
import {loadOpportunityDatasets} from 'lib/modules/opportunity-datasets/actions'
import selectActiveAnalysis from 'lib/selectors/active-regional-analysis'
import selectRegionalAnalyses from 'lib/selectors/regional-analyses'
import withInitialFetch from 'lib/with-initial-fetch'

const REFETCH_INTERVAL = 15 * 1000 // 15 seconds

function RegionalPage(p) {
  const dispatch = useDispatch()
  const allAnalyses = useSelector(selectRegionalAnalyses)
  const activeAnalysis = useSelector(selectActiveAnalysis)

  function _deleteAnalysis() {
    if (
      window.confirm('Are you sure you wish to remove this regional analysis?')
    ) {
      // clear active analysis
      dispatch(setSearchParameter('activeId'))
      dispatch(deleteRegionalAnalysis(activeAnalysis._id))
    }
  }

  useInterval(() => dispatch(loadAllAnalyses(p.regionId)), REFETCH_INTERVAL)

  return (
    <InnerDock className='block'>
      <legend>
        <Icon icon={faServer} /> Regional Analyses
      </legend>
      {allAnalyses.length > 0 ? (
        <Selector
          activeAnalysis={activeAnalysis}
          deleteAnalysis={_deleteAnalysis}
          allAnalyses={allAnalyses}
          key={activeAnalysis}
        />
      ) : (
        <div className='alert alert-warning'>
          You have no running or completed regional analysis jobs! To create
          one, go to the single point analysis page.
        </div>
      )}
      {activeAnalysis && (
        <Regional
          analysis={activeAnalysis}
          deleteAnalysis={_deleteAnalysis}
          key={activeAnalysis._id}
          opportunityDatasets={p.opportunityDatasets}
          regionalAnalyses={allAnalyses}
          setMapChildren={p.setMapChildren}
        />
      )}
    </InnerDock>
  )
}

async function initialFetch(store, query) {
  const [regionalAnalyses, opportunityDatasets, region] = await Promise.all([
    store.dispatch(loadAllAnalyses(query.regionId)),
    store.dispatch(loadOpportunityDatasets(query.regionId)),
    store.dispatch(loadRegion(query.regionId))
  ])

  return {
    analysis: regionalAnalyses.find(a => a._id === query.analysisId),
    opportunityDatasets,
    region,
    regionalAnalyses
  }
}

export default withInitialFetch(RegionalPage, initialFetch)
