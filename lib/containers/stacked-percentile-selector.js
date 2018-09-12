// @flow
import message from '@conveyal/woonerf/message'
import {connect} from 'react-redux'
import get from 'lodash/get'

import {setProfileRequest} from '../actions/analysis'
import StackedPercentileSelector
  from '../components/analysis/stacked-percentile-selector'
import * as select from '../selectors'
import {activeOpportunityDataset} from '../modules/opportunity-datasets/selectors'

function mapStateToProps (state, ownProps) {
  const projectName = get(state, 'project.currentProject.name')
  const variantId = get(state, 'analysis.profileRequest.variantIndex', 0)
  const variantName = get(state, 'project.currentProject.variants', [])[variantId]

  const comparisonProject = select.comparisonProject(state, ownProps)

  let comparisonProjectName = null
  if (comparisonProject) {
    // variant -1 indicates no modifications, just use the raw bundle
    const comparisonVariantId = get(state, 'analysis.comparisonVariant', -1)
    const variantName = comparisonVariantId >= 0
      ? comparisonProject.variants[comparisonVariantId]
      : message('analysis.baseline')
    comparisonProjectName = `${comparisonProject.name}: ${variantName}`
  }

  const opportunityDataset = activeOpportunityDataset(state, ownProps)

  return {
    accessibility: select.accessibility(state, ownProps),
    comparisonAccessibility: select.comparisonAccessibility(state, ownProps),
    comparisonInProgress: select.comparisonInProgress(state, ownProps),
    comparisonPercentileCurves: select.comparisonPercentileCurves(
      state,
      ownProps
    ),
    comparisonProjectName,
    opportunityDatasetName: opportunityDataset && opportunityDataset.name,
    isFetchingIsochrone: get(state, 'analysis.isFetchingIsochrone'),
    isochroneCutoff: select.maxTripDurationMinutes(state, ownProps),
    percentileCurves: select.percentileCurves(state, ownProps),
    maxAccessibility: select.maxAccessibility(state, ownProps),
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
