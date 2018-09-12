// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'

import {
  MAP_STATE_HIGHLIGHT_SEGMENT,
  MAP_STATE_HIGHLIGHT_STOP
} from '../../constants'
import {Text} from '../input'
import {Button} from '../buttons'
import type {GTFSStop, Stop, Timetable} from '../../types'

import SegmentSpeeds from './segment-speeds'
import TimetableEntry from './timetable-entry'

type Props = {
  allPhaseFromTimetableStops: any,
  bidirectional: boolean,
  modificationStops: GTFSStop[],
  numberOfStops: number,
  projectTimetables: Timetable[],
  qualifiedStops: Stop[],
  remove: () => void,
  segmentDistances: number[],

  setMapState: (any) => void,
  timetable: Timetable,
  update: (any) => void
}

type State = {
  collapsed: boolean
}

/** Represents a PatternTimetable */
export default class TimetableComponent
  extends PureComponent<void, Props, State> {
  state = {
    collapsed: true
  }

  _changeName = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.props.update({name: e.target.value})
  }

  _highlightSegment = (segmentIndex: number) => {
    const {setMapState} = this.props
    setMapState({
      state: MAP_STATE_HIGHLIGHT_SEGMENT,
      segmentIndex
    })
  }

  _highlightStop = (stopIndex: number) => {
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

  _toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  render () {
    const {
      allPhaseFromTimetableStops,
      bidirectional,
      modificationStops,
      numberOfStops,
      qualifiedStops,
      projectTimetables,
      segmentDistances,
      timetable,
      update
    } = this.props
    const {collapsed} = this.state
    return (
      <section className='panel panel-default inner-panel'>
        <a
          className='panel-heading clearfix'
          onClick={this._toggleCollapsed}
          style={{cursor: 'pointer'}}
          tabIndex={0}
        >
          <Icon type='calendar' />
          <strong>
            {' '}{timetable.name}
          </strong>
          <Icon className='pull-right' type={collapsed ? 'caret-right' : 'caret-down'} />
        </a>

        {!collapsed &&
          <div className='panel-body'>
            <Text
              name='Name'
              onChange={this._changeName}
              value={timetable.name}
            />
            <TimetableEntry
              allPhaseFromTimetableStops={allPhaseFromTimetableStops}
              bidirectional={bidirectional}
              modificationStops={modificationStops}
              projectTimetables={projectTimetables}
              timetable={timetable}
              update={update}
            />
            <SegmentSpeeds
              dwellTime={timetable.dwellTime}
              dwellTimes={timetable.dwellTimes || []}
              highlightSegment={this._highlightSegment}
              highlightStop={this._highlightStop}
              qualifiedStops={qualifiedStops}
              numberOfStops={numberOfStops}
              segmentDistances={segmentDistances}
              segmentSpeeds={timetable.segmentSpeeds}
              update={update}
            />
            <Button
              block
              onClick={this._remove}
              style='danger'
              title='Delete timetable'
            >
              <Icon type='close' /> Delete Timetable
            </Button>
          </div>}
      </section>
    )
  }
}
