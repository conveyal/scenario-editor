/** Represents a single frequency entry */

import React, {Component, PropTypes} from 'react'

import TimetableEntry from './timetable-entry'
import SelectTrip from './select-trip'
import SelectPatterns from './select-patterns'
import {Text} from '../input'
import Icon from '../icon'
import {Button} from '../buttons'

export default class FrequencyEntry extends Component {
  static propTypes = {
    feed: PropTypes.object.isRequired,
    remove: PropTypes.func.isRequired,
    routes: PropTypes.array.isRequired,
    setActiveTrips: PropTypes.func.isRequired,
    timetable: PropTypes.object.isRequired,
    trip: PropTypes.string,
    update: PropTypes.func.isRequired
  }

  _changeTrip = (sourceTrip) => {
    this.props.update({sourceTrip})
  }

  _selectPattern = ({ trips }) => {
    this.props.setActiveTrips(trips)
    this.props.update({patternTrips: trips, sourceTrip: trips[0]})
  }

  _changeName = (e) => {
    this.props.update({name: e.target.value})
  }

  _setActiveTrips = (e) => {
    this.props.setActiveTrips(this.props.timetable.patternTrips)
  }

  _remove = () => {
    if (window.confirm('Are you sure you want to remove this frequency entry?')) {
      this.props.remove()
    }
  }

  render () {
    const {feed, routes, timetable, update} = this.props
    const routePatterns = feed && routes[0] && feed.routesById[routes[0]].patterns
    return (
      <div className='panel panel-default inner-panel' onFocus={this._setActiveTrips}>
        <div className='panel-heading clearfix'>
          <strong>{timetable.name}</strong>
        </div>

        <div className='panel-body'>
          <Text
            name='Name'
            onChange={this._changeName}
            value={timetable.name}
            />

          {routePatterns &&
            <SelectPatterns
              onChange={this._selectPattern}
              routePatterns={routePatterns}
              trips={timetable.patternTrips}
              />
          }

          <SelectTrip
            feed={feed}
            onChange={this._changeTrip}
            patternTrips={timetable.patternTrips}
            routes={routes}
            trip={timetable.sourceTrip}
            />

          <TimetableEntry
            timetable={timetable}
            update={update}
            />

          <Button
            block
            onClick={this._remove}
            style='danger'
            title='Delete frequency entry'
            >
            <Icon type='close' /> Delete frequency entry
          </Button>
        </div>
      </div>
    )
  }
}
