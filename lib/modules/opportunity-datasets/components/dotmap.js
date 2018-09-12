// @flow
import {colorizers} from '@conveyal/gridualizer'
import {connect} from 'react-redux'

import Gridualizer from '../../../components/map/gridualizer'
import * as select from '../selectors'

function mapStateToProps (state, ownProps) {
  const grid = select.activeOpportunityDatasetGrid(state, ownProps)
  if (!grid) return {}

  return {
    colorizer: colorizers.dot(),
    grid
  }
}

/**
 * Container for drawing opportunity data on the map.
 */
export default connect(mapStateToProps)(Gridualizer)
