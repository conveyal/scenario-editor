// @flow
import {color as parseColor} from 'd3-color'
import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'

import colors from '../../constants/colors'
import DirectionalMarkers from '../directional-markers'
import PatternGeometry from '../map/geojson-patterns'
import {getPatternsForModification} from '../../utils/patterns'

type Props = {
  color: string,
  dim: boolean,
  opacity: number
}

/**
 * Display patterns on the map
 */
export default class PatternLayer extends PureComponent<Props, State> {
  static defaultProps = {
    color: colors.NEUTRAL
  }

  static propTypes = {
    activeTrips: PropTypes.array,
    color: PropTypes.string.isRequired,
    dim: PropTypes.bool,
    feed: PropTypes.object,
    modification: PropTypes.object.isRequired
  }

  state = getStateFromProps(this.props)

  componentWillReceiveProps (nextProps: Props) {
    this.setState(getStateFromProps(nextProps))
  }

  render () {
    const {color, patterns} = this.state

    if (patterns && patterns.length > 0) {
      return (
        <g>
          <PatternGeometry color={color} patterns={patterns} />
          <DirectionalMarkers color={color} patterns={patterns} />
        </g>
      )
    } else {
      return <g />
    }
  }
}

function getStateFromProps (props) {
  const color = parseColor(props.color)
  if (props.dim) color.opacity = 0.2
  return {
    color: color + '',
    patterns: getPatternsForModification(props)
  }
}
