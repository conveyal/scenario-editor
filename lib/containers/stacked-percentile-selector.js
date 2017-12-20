// @flow
import {connect} from 'react-redux'

import {setProfileRequest} from '../actions/analysis'
import StackedPercentileSelector
  from '../components/analysis/stacked-percentile-selector'
import selectAccessibility from '../selectors/accessibility'
import selectComparisonAccessibility
  from '../selectors/comparison-accessibility'
import selectMaxAccessibility from '../selectors/max-accessibility'
import selectPercentileCurves from '../selectors/percentile-curves'
import selectComparisonPercentileCurves
  from '../selectors/comparison-percentile-curves'
import selectComparisonInProgress from '../selectors/comparison-in-progress'
import selectComparisonProject from '../selectors/comparison-project'
import selectMaxTripDurationMinutes from '../selectors/max-trip-duration-minutes'
import messages from '../utils/messages'

import OpportunityDatasets from '../modules/opportunity-datasets'

function mapStateToProps (state, ownProps) {
  const {analysis, project} = state
  const projectName = project.currentProject.name
  const variantId = analysis.activeVariant || 0
  const variantName = project.currentProject.variants[variantId]

  const comparisonProject = selectComparisonProject(state, ownProps)

  let comparisonProjectName = null
  if (comparisonProject) {
    // variant -1 indicates no modifications, just use the raw bundle
    const variantName = analysis.comparisonVariant >= 0
      ? comparisonProject.variants[analysis.comparisonVariant]
      : messages.analysis.baseline
    comparisonProjectName = `${comparisonProject.name}: ${variantName}`
  }

  const activeOpportunityDataset = OpportunityDatasets.selectors.selectActiveOpportunityDataset(state, ownProps)

  return {
    accessibility: selectAccessibility(state, ownProps),
    comparisonAccessibility: selectComparisonAccessibility(state, ownProps),
    comparisonInProgress: selectComparisonInProgress(state, ownProps),
    comparisonPercentileCurves: selectComparisonPercentileCurves(
      state,
      ownProps
    ),
    comparisonProjectName,
    opportunityDatasetName: activeOpportunityDataset && activeOpportunityDataset.name,
    isFetchingIsochrone: analysis.isFetchingIsochrone,
    isochroneCutoff: selectMaxTripDurationMinutes(state, ownProps),
    percentileCurves: selectPercentileCurves(state, ownProps),
    maxAccessibility: selectMaxAccessibility(state, ownProps),
    projectName: `${projectName}: ${variantName}`
  }
}

function matchDispatchToProps (dispatch: Dispatch, ownProps) {
  return {
    setIsochroneCutoff: (cutoff) =>
      dispatch(setProfileRequest({maxTripDurationMinutes: cutoff}))
  }
}

export default connect(mapStateToProps, matchDispatchToProps)(
  StackedPercentileSelector
)
