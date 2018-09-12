// @flow
import lonlat from '@conveyal/lonlat'
import {Map, MouseEvent} from 'leaflet'
import PropTypes from 'prop-types'
import React, {Component} from 'react'

import colors from '../../constants/colors'
import type {Grid} from '../../types'

import Gridualizer from './gridualizer'

const NO_DATA = -Math.pow(2, 30)

type Props = {
  _id: string,
  baseGrid: Grid,
  breaks: number[],
  comparisonId: string,
  differenceGrid: Grid,
  isRegionalAnalysisSamplingDistributionComponentOnMap: boolean,
  minimumImprovementProbability: number,
  probabilityGrid: Grid,
  setRegionalAnalysisOrigin: Object => void
}

type DefaultProps = {
  minimumImprovementProbability: number
}

/**
 * A layer showing a proabilistic regional comparison
 */
export default class Regional extends Component<DefaultProps, Props, void> {
  static defaultProps = {
    minimumImprovementProbability: 0 // https://xkcd.com/1478/
  }

  static contextTypes = {
    map: PropTypes.instanceOf(Map)
  }

  componentDidMount () {
    const {map} = this.context
    map.on('click', this.onMapClick)
  }

  componentWillUnmount () {
    const {map} = this.context
    map.off('click', this.onMapClick)
  }

  onMapClick = (e: MouseEvent) => {
    const {
      _id,
      comparisonId,
      setRegionalAnalysisOrigin,
      isRegionalAnalysisSamplingDistributionComponentOnMap
    } = this.props
    // if the destination component is already on the map, don't add it - change
    // destination by dragging destination marker
    if (!isRegionalAnalysisSamplingDistributionComponentOnMap) {
      setRegionalAnalysisOrigin({
        regionalAnalysisId: _id,
        comparisonRegionalAnalysisId: comparisonId,
        lonlat: lonlat(e.latlng)
      })
    }
  }

  render () {
    const {
      baseGrid,
      comparisonId,
      differenceGrid,
      probabilityGrid,
      minimumImprovementProbability,
      breaks
    } = this.props

    if (!breaks || breaks.length === 0) {
      return <span /> // TODO do this one level higher
    } else if (comparisonId == null) {
      return (
        <Gridualizer
          breaks={breaks}
          colors={colors.REGIONAL_GRADIENT}
          grid={baseGrid}
        />
      )
    } else {
      // now, mask with probability; probability is put in grids as ints 0 - 100k
      const maskedGrid = mask(
        differenceGrid,
        probabilityGrid,
        minimumImprovementProbability * 1e5
      )

      return (
        <Gridualizer
          grid={maskedGrid}
          colors={colors.REGIONAL_COMPARISON_GRADIENT}
          breaks={breaks}
          noDataValue={NO_DATA}
        />
      )
    }
  }
}

/**
 * TODO Create this in a selector
 * Mask a grid, returning a new, masked grid
 */
function mask (grid, probabilityGrid, cutoff) {
  const gridsDoNotAlign =
    grid.west !== probabilityGrid.west ||
    grid.north !== probabilityGrid.north ||
    grid.zoom !== probabilityGrid.zoom ||
    grid.width !== probabilityGrid.width ||
    grid.height !== probabilityGrid.height

  if (gridsDoNotAlign) {
    throw new Error('Grids do not align for masking')
  }

  const {north, west, zoom, width, height} = grid

  const newGrid = {
    north,
    west,
    zoom,
    width,
    height,
    data: new Int32Array(width * height),
    // start at zero not Infinity to avoid having to update min/max for cells where probability
    // is less than the cutoff
    min: 0,
    max: 0
  }

  for (let pixel = 0; pixel < width * height; pixel++) {
    if (probabilityGrid.data[pixel] < cutoff) newGrid.data[pixel] = 0
    else {
      newGrid.data[pixel] = grid.data[pixel]
      if (newGrid.min > grid.data[pixel]) newGrid.min = grid.data[pixel]
      if (newGrid.max < grid.data[pixel]) newGrid.max = grid.data[pixel]
    }
  }

  return newGrid
}
