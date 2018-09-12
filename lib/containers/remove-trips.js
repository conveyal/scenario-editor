// @flow
import {connect} from 'react-redux'

import RemoveTrips from '../components/modification/remove-trips'
import * as select from '../selectors'
import type {Modification} from '../types'

function mapStateToProps (
  state: any,
  ownProps: {modification: Modification}
): any {
  return {
    feeds: select.feedsWithBundleNames(state, ownProps),
    routePatterns: select.routePatterns(state, ownProps),
    selectedFeed: select.modificationFeed(state, ownProps)
  }
}

export default connect(mapStateToProps)(RemoveTrips)
