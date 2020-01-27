import {
  faCopy,
  faExclamationCircle,
  faPlus
} from '@fortawesome/free-solid-svg-icons'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'

import {DEFAULT_SEGMENT_SPEED} from 'lib/constants/timetables'
import CopyTimetable from 'lib/containers/copy-timetable'
import {create as createTimetable} from 'lib/utils/timetable'

import {Button} from '../buttons'
import H5 from '../h5'
import Icon from '../icon'
import Modal, {ModalTitle} from '../modal'
import P from '../p'

import TimetableComponent from './timetable'

export default class Timetables extends PureComponent {
  state = {
    showCopyModal: false
  }

  /** add a timetable */
  _create = () => {
    const {timetables, segmentDistances, update} = this.props
    const length = timetables.length
    const speeds =
      length > 0
        ? timetables[0].segmentSpeeds
        : segmentDistances.map(() => DEFAULT_SEGMENT_SPEED)
    update({
      timetables: [...timetables, createTimetable(speeds, length)]
    })
  }

  _createFromOther = timetable => {
    const {timetables, update} = this.props
    this._hideCopyModal()
    update({
      timetables: [...timetables, timetable]
    })
  }

  _hideCopyModal = () => {
    this.setState({showCopyModal: false})
  }

  _showCopyModal = () => {
    this.setState({
      showCopyModal: true
    })
  }

  /** update a timetable */
  _update = memoize(index => newTimetableProps => {
    const timetables = [...this.props.timetables]
    timetables[index] = {
      ...timetables[index],
      ...newTimetableProps
    }
    this.props.update({timetables})
  })

  _remove = memoize(index => () => {
    const timetables = [...this.props.timetables]
    timetables.splice(index, 1)
    this.props.update({timetables})
  })

  render() {
    const {
      bidirectional,
      modificationStops,
      numberOfStops,
      qualifiedStops,
      projectTimetables,
      segmentDistances,
      setMapState,
      timetables
    } = this.props
    return (
      <div>
        <H5>Timetables ({timetables.length})</H5>
        {timetables.length === 0 && (
          <div className='alert alert-danger' role='alert'>
            <Icon icon={faExclamationCircle} /> Modification needs at least 1
            timetable
          </div>
        )}
        <P>
          <Button block onClick={this._create} style='success'>
            <Icon icon={faPlus} /> Add new timetable
          </Button>
        </P>
        <P>
          <Button block onClick={this._showCopyModal} style='success'>
            <Icon icon={faCopy} /> Copy existing timetable
          </Button>
        </P>
        {timetables.map((tt, i) => (
          <TimetableComponent
            bidirectional={bidirectional}
            key={`timetable-${i}`}
            modificationStops={modificationStops}
            numberOfStops={numberOfStops}
            qualifiedStops={qualifiedStops}
            remove={this._remove(i)}
            projectTimetables={projectTimetables}
            segmentDistances={segmentDistances}
            setMapState={setMapState}
            timetable={tt}
            update={this._update(i)}
          />
        ))}
        {this.state.showCopyModal && (
          <Modal onRequestClose={this._hideCopyModal}>
            <ModalTitle>Copy Existing Timetable</ModalTitle>
            <CopyTimetable create={this._createFromOther} />
          </Modal>
        )}
      </div>
    )
  }
}
