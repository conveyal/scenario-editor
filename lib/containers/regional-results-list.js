// @flow
import {connect} from 'react-redux'
import {push} from 'react-router-redux'

import RegionalResultsList from '../components/analysis/regional-results-list'
import * as select from '../selectors'
import {
  load,
  deleteRegionalAnalysis,
  setActiveRegionalAnalyses
} from '../actions/analysis/regional'

function mapStateToProps (state, ownProps) {
  return {
    allAnalyses: select.regionalAnalyses(state, ownProps),
    regionId: select.currentRegionId(state, ownProps)
  }
}

function mapDispatchToProps (dispatch: Dispatch, ownProps) {
  return {
    loadAllAnalyses: (regionId) => dispatch(load(regionId)),
    deleteAnalysis: analysisId => dispatch(deleteRegionalAnalysis(analysisId)),
    goToAnalysis: ({analysisId, regionId}) =>
      dispatch([
        setActiveRegionalAnalyses({_id: analysisId}),
        push(`/regions/${regionId}/regional/${analysisId}`)
      ]),
    goToSinglePointAnalysisPage: (regionId) =>
      dispatch(push(`/regions/${regionId}/analysis`))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegionalResultsList)
