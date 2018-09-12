// @flow

import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import get from 'lodash/get'
import React, {Component} from 'react'
import uuid from 'uuid'

import {DEFAULT_SEGMENT_SPEED} from '../../constants/timetables'
import {Button} from '../buttons'
import {Select} from '../input'
import {ModalBody} from '../modal'

type ModelWithName = {
  _id: string,
  name: string
}

type Timetable = ModelWithName & {
  dwellTimes: Array<any>,
  segmentSpeeds: Array<number>
}

type Modification = ModelWithName & {
  segments: Array<any>,
  timetables: Array<Timetable>
}

type Project = ModelWithName & {
  modifications: Array<Modification>
}

type Region = ModelWithName & {
  projects: Array<Project>
}

type Props = {
  create: () => void,
  currentModification: Modification,
  currentProject: Project,
  currentRegionId: string,
  getTimetables: () => Promise<{
    status: number,
    value: ?Array<Region>
  }>
}

type State = {
  data: any,
  loadingData: boolean,
  modification: ?ModelWithName,
  modificationOptions: Array<Modification>,
  project: ?ModelWithName,
  projectOptions: Array<ModelWithName>,
  region: ?ModelWithName,
  regionOptions: Array<ModelWithName>,
  timetable: ?Timetable,
  timetableOptions: Array<Timetable>
}

export default class CopyTimetable extends Component<Props, State> {
  state = {
    data: [],
    loadingData: true,
    modification: undefined,
    modificationOptions: [],
    project: undefined,
    projectOptions: [],
    region: undefined,
    regionOptions: [],
    timetable: undefined,
    timetableOptions: []
  }

  componentDidMount () {
    const {
      currentModification: curModification,
      currentProject: curProject,
      currentRegionId,
      getTimetables
    } = this.props

    getTimetables()
      .then(response => {
        if (!response.status === 200) return
        const regions: Array<Region> = (response.value: any)

        // recalculate currents to make sure we're using the data from the
        // api/timetable webservice
        // in the store, projects don't have lists of modifications
        let currentRegion: ?Region = regions.find(region => region._id === currentRegionId)

        // the webservice only returns a hierarchical list of regions, projects,
        // modifications objects that have a timetable at the bottom of the
        // hierarchy.  Therefore, we'll select the first region that is available
        // if the current region wasn't found in the webservice
        if (!currentRegion) currentRegion = regions[0]

        // find the project
        let currentProject
        if (currentRegion) {
          currentProject = currentRegion.projects.find(
            project => project._id === curProject._id
          )

          // if the current project we're on doesn't have a timetable, select
          // the first project returned by the webservice
          if (!currentProject) {
            currentProject = currentRegion.projects[0]
          }
        }

        let currentModification
        if (currentProject) {
          currentModification = currentProject.modifications.find(
            modification => modification._id === curModification._id
          )

          // if the current modification we're on doesn't have a timetable,
          // select the first modification returned by the webservice
          if (!currentModification) {
            currentModification = currentProject.modifications[0]
          }
        }

        const currentTimetable = currentModification &&
            currentModification.timetables &&
            currentModification.timetables.length > 0
          ? currentModification.timetables[0]
          : undefined

        this.setState({
          data: regions,
          loadingData: false,
          modification: currentModification,
          modificationOptions: currentProject ? currentProject.modifications : [],
          project: currentProject,
          projectOptions: currentRegion ? currentRegion.projects : [],
          region: currentRegion,
          regionOptions: regions,
          timetable: currentTimetable,
          timetableOptions: currentModification ? currentModification.timetables : []
        })
      })
  }

  _onConfirmTimetable = () => {
    const {currentModification} = this.props
    const {timetable} = this.state
    if (!timetable) {
      return
    }
    const numSegments = currentModification.segments ? currentModification.segments.length : 0

    this.props.create({
      ...timetable,
      _id: uuid.v4(),
      dwellTimes: timetable.dwellTimes.slice(0, numSegments),
      name: `Copy of ${timetable.name}`,
      phaseAtStop: null,
      phaseFromStop: null,
      segmentSpeeds: numSegments > timetable.segmentSpeeds.length
        ? Array(numSegments)
          .fill(DEFAULT_SEGMENT_SPEED)
          .map((v, i) => timetable.segmentSpeeds[i] || v)
        : timetable.segmentSpeeds.slice(0, numSegments)
    })
  }

  _getStateForNewProject (project: ?Project): {
    modification: ?Modification,
    modificationOptions: Array<Modification>,
    project: ?Project,
    timetable: ?Timetable,
    timetableOptions: Array<Timetable>
  } {
    const modificationOptions = (project || {}).modifications || []
    const modification = modificationOptions[0]
    const timetableOptions = (modification || {}).timetables || []
    const timetable = timetableOptions[0]
    return {
      modification,
      modificationOptions,
      project,
      timetable,
      timetableOptions
    }
  }

  _onSelectModification = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const modification: Modification = (
      // cast to make flow happy
      this.state.modificationOptions.find(m => m._id === e.target.value): any
    )
    this.setState({
      modification,
      timetable: (modification.timetables || [])[0],
      timetableOptions: modification.timetables
    })
  }

  _onSelectProject = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const project = this.state.projectOptions.find(p => p._id === e.target.value)
    this.setState(this._getStateForNewProject(project))
  }

  _onSelectRegion = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const region: Region = (
      // cast to make flow happy
      this.state.regionOptions.find(r => r._id === e.target.value): any
    )
    const projectOptions = region.projects || []
    this.setState({
      ...this._getStateForNewProject(projectOptions[0]),
      projectOptions,
      region
    })
  }

  _onSelectTimetable = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({
      timetable: this.state.timetableOptions.find(tt => tt._id === e.target.value)
    })
  }

  render () {
    const {currentModification} = this.props
    const {
      loadingData,
      modification,
      modificationOptions,
      project,
      projectOptions,
      region,
      regionOptions,
      timetable,
      timetableOptions
    } = this.state

    // render loading dialog if loading
    if (loadingData) {
      return (
        <ModalBody>
          <p>Loading...</p>
        </ModalBody>
      )
    }

    // if not loading and the region does not exist that means there are no
    // timetables to select from.  Show advisory message.
    if (!region) {
      return (
        <ModalBody>
          <div className='alert alert-danger' role='alert'>
            <Icon type='exclamation-circle' />
            No timetables available to copy from!  Please create a timetable manually.
          </div>
        </ModalBody>
      )
    }

    // we have timetables to select, show selectors
    return (
      <ModalBody>
        <Select
          label='Region'
          onBlur={noop}
          onChange={this._onSelectRegion}
          value={region._id}
        >
          {regionOptions.map(regionOption => (
            <option key={`regionOption-${regionOption._id}`} value={regionOption._id}>
              {get(regionOption, 'name', 'unnamed')}
            </option>
          ))}
        </Select>
        <Select
          label='Project'
          onBlur={noop}
          onChange={this._onSelectProject}
          value={project && project._id}
        >
          {projectOptions.map(projectOption => (
            <option key={`projectOption-${projectOption._id}`} value={projectOption._id}>
              {get(projectOption, 'name', 'unnamed')}
            </option>
          ))}
        </Select>
        <Select
          label='Modification'
          onBlur={noop}
          onChange={this._onSelectModification}
          value={modification && modification._id}
        >
          {modificationOptions.map(modificationOption => (
            <option key={`modificationOption-${modificationOption._id}`} value={modificationOption._id}>
              {get(modificationOption, 'name', 'unnamed')}
            </option>
          ))}
        </Select>
        <Select
          label='Timetable'
          onBlur={noop}
          onChange={this._onSelectTimetable}
          value={timetable && timetable._id}
        >
          {timetableOptions.map(timetableOption => (
            <option key={`timetableOption-${timetableOption._id}`} value={timetableOption._id}>
              {get(timetableOption, 'name', 'unnamed')}
            </option>
          ))}
        </Select>
        {modification &&
          currentModification.segments.length !== modification.segments.length &&
          <div className='alert alert-info' role='alert'>
            <Icon type='exclamation-circle' />
            {(currentModification.segments.length === 0 ||
              modification.segments.length === 0) &&
              message(
                'modification.copyTimetable.noSegments',
                {segmentSpeed: DEFAULT_SEGMENT_SPEED}
              )
            }
            {currentModification.segments.length > modification.segments.length &&
              modification.segments.length > 0 &&
              message(
                'modification.copyTimetable.curHasMoreSegments',
                {
                  numSegments: modification.segments.length,
                  segmentSpeed: DEFAULT_SEGMENT_SPEED
                }
              )
            }
            {currentModification.segments.length < modification.segments.length &&
              currentModification.segments.length > 0 &&
              message(
                'modification.copyTimetable.curHasLessSegments',
                { numSegments: currentModification.segments.length }
              )
            }
          </div>
        }
        <p>
          <Button block onClick={this._onConfirmTimetable} style='success'>
            <Icon type='plus' /> Copy into new timetable
          </Button>
        </p>
      </ModalBody>
    )
  }
}

function noop () {}
