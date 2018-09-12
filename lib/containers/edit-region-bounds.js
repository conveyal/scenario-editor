// @flow
import {connect} from 'react-redux'

import {setLocally} from '../actions/region'
import EditRegionBounds from '../components/map/edit-region-bounds'
import selectCurrentRegion from '../selectors/current-region'

function mapStateToProps (state, ownProps) {
  const region = selectCurrentRegion(state, ownProps) || {}
  return {
    bounds: region.bounds || {},
    isLoaded: !!region.bounds,
    region
  }
}

export default connect(mapStateToProps, {setLocally})(EditRegionBounds)
