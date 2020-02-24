import {faServer} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setSearchParameter} from 'lib/actions'
import {
  deleteRegionalAnalysis,
  load as loadAllAnalyses
} from 'lib/actions/analysis/regional'
import RegionalAnalysis from 'lib/containers/regional-analysis-results'
import useInterval from 'lib/hooks/use-interval'
import selectActiveAnalysis from 'lib/selectors/active-regional-analysis'
import selectRegionalAnalyses from 'lib/selectors/regional-analyses'

import Icon from '../icon'
import InnerDock from '../inner-dock'

import Selector from './regional-analysis-selector'

const REFETCH_INTERVAL = 15 * 1000 // 15 seconds

export default function RegionalAnalysisResultsList(p) {
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
        <RegionalAnalysis
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
