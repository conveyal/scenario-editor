// @flow
import {classifiers, colorizers} from '@conveyal/gridualizer'
import {connect} from 'react-redux'
import {interpolatePuBuGn as getColor} from 'd3-scale-chromatic'

import Gridualizer from '../../../components/map/gridualizer'
import * as select from '../selectors'

const NUM_COLORS = 5
const OPACITY = 0.42
const COLORS = ['rgba(0, 0, 0, 0)']
for (let i = 0; i < NUM_COLORS; i++) {
  const rgb = getColor(i / (NUM_COLORS - 1))
  COLORS.push(`rgba(${rgb.slice(4, -1)}, ${OPACITY})`)
}

function mapStateToProps (state, ownProps) {
  const grid = select.activeOpportunityDatasetGrid(state, ownProps)
  if (!grid) return {}

  const classify = classifiers.ckmeans({})
  const breaks = classify(grid, COLORS.length - 1)

  return {
    colorizer: colorizers.choropleth([1, ...breaks], COLORS),
    grid
  }
}

export default connect(mapStateToProps)(Gridualizer)
