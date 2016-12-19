import React, {PropTypes} from 'react'

import DeepEqual from '../deep-equal'
import Icon from '../icon'
import {Number as NumberInput} from '../input'

export default class SegmentSpeeds extends DeepEqual {
  static propTypes = {
    defaultSpeed: PropTypes.number.isRequired,
    segments: PropTypes.array.isRequired,
    speeds: PropTypes.array.isRequired,
    setSpeeds: PropTypes.func.isRequired
  }

  state = {
    collapsed: true
  }

  _toggleCollapsed = () => {
    this.setState({
      ...this.state,
      collapsed: !this.state.collapsed
    })
  }

  _setSpeed = (index, e) => {
    const {segments, defaultSpeed, speeds, setSpeeds} = this.props
    const speed = Number(e.target.value)
    if (!isNaN(speed)) {
      const newSpeeds = speeds.length !== segments.length
        ? segments.map(() => defaultSpeed)
        : speeds

      newSpeeds[index] = speed
      setSpeeds(newSpeeds)
    }
  }

  _clearSpeeds = () => {
    if (window.confirm('Are you sure you want to clear all of the segment speeds?')) {
      this.setState({...this.state, collapsed: true})
      this.props.setSpeeds([])
    }
  }

  render () {
    const {defaultSpeed, segments, speeds} = this.props
    const {collapsed} = this.state

    return (
      <div>
        <div
          onClick={this._toggleCollapsed}
          style={{cursor: 'pointer', paddingBottom: '12px'}}>
          <Icon type={collapsed ? 'chevron-right' : 'chevron-down'} /> <strong>Set Individual Segment Speeds</strong> {!collapsed &&
            <a
              className='pull-right'
              onClick={this._clearSpeeds}
              title='Clear segment speeds'
              >
              <Icon type='remove' />
            </a>
          }
        </div>
        {!collapsed &&
          segments.map((segment, index) => (
            <NumberInput
              key={`segment-speed-${index}`}
              label={`Segment ${index + 1}`}
              onChange={this._setSpeed.bind(this, index)}
              value={speeds[index] || defaultSpeed}
              />
          ))}
      </div>
    )
  }
}
