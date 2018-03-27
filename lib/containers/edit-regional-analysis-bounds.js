// @flow
import {connect} from 'react-redux'

import EditBounds from '../components/map/edit-bounds'
import {setProfileRequest} from '../actions/analysis'
import selectCurrentRegion from '../selectors/current-region'
import get from '../utils/get'

function mapStateToProps (state, props) {
  const currentRegion = selectCurrentRegion(state, props)
  return {
    bounds: get(state, 'analysis.profileRequest.bounds', get(currentRegion, 'bounds'))
  }
}

function mapDispatchToProps (dispatch: Dispatch, props) {
  return {
    save: bounds => dispatch(setProfileRequest({bounds}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditBounds)
