import React from 'react'
import {useSelector} from 'react-redux'

import selectDisplayGrid from 'lib/selectors/regional-display-grid'
import selectDisplayScale from 'lib/selectors/regional-display-scale'
import createDrawTile from 'lib/utils/create-draw-tile'

import Gridualizer from './gridualizer'

/**
 * A map layer showing a Regional comparison
 */
let key = 0
export default React.memo(function Regional() {
  const grid = useSelector(selectDisplayGrid)
  const {error, colorizer} = useSelector(selectDisplayScale) || {}

  if (!grid || !colorizer || error) return null

  // Function is cheap. It just wraps draw tile with the necessary parts
  const drawTile = createDrawTile({colorizer, grid})

  // Remount every time there is a change to drawTile
  return <Gridualizer key={key++} drawTile={drawTile} zIndex={300} />
})
