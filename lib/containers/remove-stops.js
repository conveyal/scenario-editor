// @flow
import {connect} from 'react-redux'

import RemoveStops from '../components/modification/remove-stops'
import * as select from '../selectors'
import type {Modification} from '../types'

function mapStateToProps (
  state: any,
  ownProps: {modification: Modification}
): any {
  return {
    feeds: select.feedsWithBundleNames(state, ownProps),
    routePatterns: select.routePatterns(state, ownProps),
    routeStops: select.routeStops(state, ownProps),
    selectedFeed: select.modificationFeed(state, ownProps),
    selectedStops: select.selectedStops(state, ownProps)
  }
}

export default connect(mapStateToProps)(RemoveStops)
