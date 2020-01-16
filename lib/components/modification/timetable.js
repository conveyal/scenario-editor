import {faCalendar, faTimes} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import {
  MAP_STATE_HIGHLIGHT_SEGMENT,
  MAP_STATE_HIGHLIGHT_STOP
} from 'lib/constants'

import Icon from '../icon'
import {Text} from '../input'
import * as Panel from '../panel'
import {Button} from '../buttons'

import SegmentSpeeds from './segment-speeds'
import TimetableEntry from './timetable-entry'

/** Represents a PatternTimetable */
export default class TimetableComponent extends React.Component {
  _changeName = e => {
    this.props.update({name: e.currentTarget.value})
  }

  _highlightSegment = segmentIndex => {
    const {setMapState} = this.props
    setMapState({
      state: MAP_STATE_HIGHLIGHT_SEGMENT,
      segmentIndex
    })
  }

  _highlightStop = stopIndex => {
    const {setMapState} = this.props
    setMapState({
      state: MAP_STATE_HIGHLIGHT_STOP,
      stopIndex
    })
  }

  _remove = () => {
    if (
      window.confirm('Are you sure you would like to remove this timetable?')
    ) {
      this.props.remove()
    }
  }

  render() {
    const p = this.props
    return (
      <Panel.Collapsible
        defaultExpanded={false}
        heading={() => (
          <>
            <Icon icon={faCalendar} />
            <strong> {p.timetable.name}</strong>
          </>
        )}
      >
        <Panel.Body>
          <Text
            name='Name'
            onChange={this._changeName}
            value={p.timetable.name}
          />
          <TimetableEntry
            bidirectional={p.bidirectional}
            modificationStops={p.modificationStops}
            projectTimetables={p.projectTimetables}
            timetable={p.timetable}
            update={p.update}
          />
          <SegmentSpeeds
            dwellTime={p.timetable.dwellTime}
            dwellTimes={p.timetable.dwellTimes || []}
            highlightSegment={this._highlightSegment}
            highlightStop={this._highlightStop}
            qualifiedStops={p.qualifiedStops}
            numberOfStops={p.numberOfStops}
            segmentDistances={p.segmentDistances}
            segmentSpeeds={p.timetable.segmentSpeeds}
            update={p.update}
          />
          <Button
            block
            onClick={this._remove}
            style='danger'
            title='Delete timetable'
          >
            <Icon icon={faTimes} /> Delete Timetable
          </Button>
        </Panel.Body>
      </Panel.Collapsible>
    )
  }
}
