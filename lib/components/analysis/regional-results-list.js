import {faServer} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  deleteRegionalAnalysis,
  load as loadAllAnalyses,
  setActiveRegionalAnalysis
} from 'lib/actions/analysis/regional'
import RegionalAnalysis from 'lib/containers/regional-analysis-results'
import useInterval from 'lib/hooks/use-interval'
import selectRegionalAnalyses from 'lib/selectors/regional-analyses'
import selectRegionalDisplayCutoff from 'lib/selectors/regional-display-cutoff'
import selectRegionalDisplayPercentile from 'lib/selectors/regional-display-percentile'

import Icon from '../icon'
import InnerDock from '../inner-dock'

import Selector from './regional-analysis-selector'

const REFETCH_INTERVAL = 60 * 1000 // 60 seconds

export default function RegionalAnalysisResultsList(p) {
  const dispatch = useDispatch()
  const allAnalyses = useSelector(selectRegionalAnalyses)
  const activeId = useSelector(state => get(state, 'regionalAnalyses.activeId'))
  const activeAnalysis = allAnalyses.find(a => a._id === activeId)
  const displayCutoff = useSelector(selectRegionalDisplayCutoff)
  const displayPercentile = useSelector(selectRegionalDisplayPercentile)

  function _deleteAnalysis(_id) {
    if (
      window.confirm('Are you sure you wish to remove this regional analysis?')
    ) {
      // clear active analysis
      dispatch(setActiveRegionalAnalysis())
      dispatch(deleteRegionalAnalysis(_id))
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
          deleteAnalysis={() => _deleteAnalysis(activeAnalysis._id)}
          key={`${activeAnalysis._id}-${displayCutoff}-${displayPercentile}`}
          opportunityDatasets={p.opportunityDatasets}
          regionalAnalyses={allAnalyses}
          setMapChildren={p.setMapChildren}
        />
      )}
    </InnerDock>
  )
}
