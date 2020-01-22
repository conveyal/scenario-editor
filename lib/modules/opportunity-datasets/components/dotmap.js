import React from 'react'
import {useSelector} from 'react-redux'

import Gridualizer from 'lib/components/map/gridualizer'
import {activeOpportunityDatasetGrid} from '../selectors'

import createDrawTile from '../create-draw-tile'

/**
 * Container for drawing opportunity data on the map.
 */
let key = 0
export default React.memo(function Dotmap() {
  const grid = useSelector(activeOpportunityDatasetGrid)
  if (!grid) return null
  const drawTile = createDrawTile(grid)
  return <Gridualizer key={key++} drawTile={drawTile} zIndex={299} />
})
