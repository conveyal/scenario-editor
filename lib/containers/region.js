// @flow
import {connect} from 'react-redux'

import {load as loadRegion} from '../actions/region'
import Region from '../components/region'
import * as select from '../selectors'

function mapStateToProps (state, ownProps) {
  return {
    region: select.currentRegion(state, ownProps),
    regionId: select.currentRegionId(state, ownProps)
  }
}

export default connect(mapStateToProps, {loadRegion})(Region)
