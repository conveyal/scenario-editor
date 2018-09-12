// @flow
import fetch from '@conveyal/woonerf/fetch'
import {connect} from 'react-redux'

import {setCenter} from '../actions/map'
import {
  create,
  deleteLocally,
  deleteRegion,
  load,
  save,
  setLocally
} from '../actions/region'
import EditRegion from '../components/edit-region'
import {CREATING_ID, DEFAULT_BOUNDS} from '../constants/region'
import * as select from '../selectors'

function mapStateToProps (state, ownProps) {
  const region = select.currentRegion(state, ownProps)
  return {
    region: region || {
      _id: CREATING_ID,
      bounds: DEFAULT_BOUNDS
    }
  }
}

function mapDispatchToProps (dispatch: Dispatch, {params}) {
  return {
    create: opts => dispatch(create(opts)),
    clearUncreatedRegion: () => dispatch(deleteLocally(CREATING_ID)),
    deleteRegion: () => dispatch(deleteRegion(params.regionId)),
    fetch: opts => dispatch(fetch(opts)),
    save: opts => dispatch(save(opts)),
    setCenter: c => dispatch(setCenter(c)),
    setLocally: p => dispatch(setLocally(p)),
    load: _id => dispatch(load(_id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRegion)
