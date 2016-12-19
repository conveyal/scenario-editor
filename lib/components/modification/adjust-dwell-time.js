/** Change dwell times */

import React, {Component, PropTypes} from 'react'

import {Number as InputNumber} from '../input'
import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'
import SelectStops from './select-stops'

export default class AdjustDwellTime extends Component {
  static propTypes = {
    feeds: PropTypes.array.isRequired,
    feedsById: PropTypes.object.isRequired,
    modification: PropTypes.object.isRequired,
    setMapState: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired
  }

  _onPatternSelectorChange = ({feed, routes, trips}) => {
    this.props.update({feed, routes, trips, stops: null})
  }

  /** we are setting a scale for existing speeds, not an actual speed */
  _setScale = (e) => {
    if (e.target.checked) this.props.update({scale: true})
  }

  /** we are setting a brand-new speed, throwing out any existing variation in speed */
  _setSpeed = (e) => {
    if (e.target.checked) this.props.update({scale: false})
  }

  /** set the factor by which we are scaling, or the speed which we are replacing */
  _setValue = (e) => {
    this.props.update({value: e.target.value})
  }

  render () {
    const {feeds, feedsById, modification, setMapState, update} = this.props
    return (
      <div>
        <SelectFeedRouteAndPatterns
          selectedFeed={feedsById[modification.feed]}
          feeds={feeds}
          onChange={this._onPatternSelectorChange}
          routes={modification.routes}
          trips={modification.trips}
          />

        {modification.routes &&
          <SelectStops
            feed={feedsById[modification.feed]}
            modification={modification}
            nullIsWildcard
            setMapState={setMapState}
            update={update}
            />}

        <br />

        <div className='form-group'>
          <label className='radio-inline'><input type='radio' value='scale' checked={modification.scale} onChange={this._setScale} />Scale existing dwell times by</label>
          <label className='radio-inline'><input type='radio' value='speed' checked={!modification.scale} onChange={this._setSpeed} />Set new dwell time to</label>
        </div>

        <InputNumber
          onChange={this._setValue}
          value={modification.value}
          />
      </div>
    )
  }
}
