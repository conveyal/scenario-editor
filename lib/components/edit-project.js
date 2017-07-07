// @flow

import React from 'react'

import {Button} from './buttons'
import DeepEqualComponent from './deep-equal'
import Icon from './icon'
import {Body, Heading, Panel} from './panel'
import {Text, File} from './input'
import messages from '../utils/messages'
import R5Version from './r5-version'

import type {Bounds, Project, LatLon} from '../types.js'

const cardinalDirections = ['North', 'South', 'East', 'West']

type Props = {
  allVersions: string[],
  bounds: Bounds,
  description: string,
  id: string,
  // we don't actually use indicators, just need them so we can re-save them with the project, hence any type
  indicators: any,
  isEditing: boolean,
  loadStatus: ?string,
  name: string,
  r5Version: string,
  releaseVersions: string[],

  // actions
  addComponentToMap(string): void,
  clearUncreatedProject(void): void,
  create(Project): void,
  load(string): void,
  removeComponentFromMap(string): void,
  save(Project): void,
  setCenter(LatLon): void,
  setLocally(Project): void
}

export default class EditProject extends DeepEqualComponent<void, Props, void> {
  state = {...this.props, saving: false}

  componentDidMount () {
    if (this.props.bounds) {
      this.props.addComponentToMap()
    }
  }

  componentWillUnmount () {
    const {clearUncreatedProject, isEditing, load, removeComponentFromMap} = this.props
    removeComponentFromMap()
    if (isEditing && !this.hasBeenDeleted) {
      load(this.props.id) // if changes weren't saved, fetch them back from the server
    }
    clearUncreatedProject()
  }

  componentWillReceiveProps (nextProps) {
    this.setState({...nextProps})
  }

  onChangeDescription = (e) => this.onChange({ description: e.target.value })
  onChangeName = (e) => this.onChange({ name: e.target.value })
  onChangeR5Version = (item) => this.onChange({ r5Version: item.value })

  onChange (updatedFields) {
    const { bounds, description, id, name, r5Version, setLocally, indicators } = this.props
    // set it locally so that state is shared with bounds editor
    setLocally({
      bounds,
      description,
      id,
      name,
      indicators,
      r5Version,
      ...updatedFields
    })

    this.setState({
      ...this.state,
      ...updatedFields
    })
  }

  _changeCustomOsm = (e) => {
    this.setState({ customOpenStreetMapData: e.target.files[0] })
  }

  _createOrSave = async (e) => {
    const {bounds, create, description, id, isEditing, name, r5Version, indicators, save} = this.props
    const { customOpenStreetMapData } = this.state

    this.setState({ saving: true })

    // Create/save will redirect back to main project page when complete
    if (isEditing) {
      save({
        bounds,
        description,
        id,
        name,
        r5Version,
        indicators,
        customOpenStreetMapData
      })
    } else {
      this._created = true
      create({
        bounds,
        description,
        name,
        r5Version,
        indicators,
        customOpenStreetMapData
      })
    }
  }

  _delete = () => {
    if (window.confirm(messages.project.deleteConfirmation)) {
      this.hasBeenDeleted = true
      this.props.deleteProject()
    }
  }

  render () {
    const {allVersions, bounds, description, isEditing, r5Version, loadStatus, releaseVersions} = this.props
    const {name, saving} = this.state
    const readyToCreate = name && name.length > 0
    return (
      <Panel>
        <Heading>{messages.project.editTitle}</Heading>
        <Body>
          <Text
            label='Project Name'
            name='Project Name'
            onChange={this.onChangeName}
            value={name}
            />
          <Text
            label='Description'
            name='Description'
            onChange={this.onChangeDescription}
            value={description}
            />
          <R5Version
            label={messages.project.r5Version}
            name={messages.project.r5Version}
            onChange={this.onChangeR5Version}
            value={r5Version}
            allVersions={allVersions}
            releaseVersions={releaseVersions}
            />
          <legend>
            OSM Bounds
          </legend>
          {cardinalDirections.map((direction) =>
            <Text
              key={`bound-${direction}`}
              label={`${direction} bound`}
              name={`${direction} bound`}
              disabled
              value={bounds[direction.toLowerCase()]}
              />)}

          <File
            label={messages.project.customOpenStreetMapData}
            name='customOpenStreetMapData'
            onChange={this._changeCustomOsm}
          />

          <Button
            block
            disabled={!readyToCreate || saving}
            onClick={this._createOrSave}
            name='Save Project'
            style='success'
            >{isEditing ? messages.project.editAction : messages.project.createAction}
          </Button>
          {isEditing &&
            <Button
              block
              onClick={this._delete}
              style='danger'
              ><Icon type='trash' /> {messages.project.deleteAction}
            </Button>
          }

          {saving &&
            <div>
              <Icon className='fa-spin' type='spinner' />&nbsp;
              {messages.project.loadStatus[loadStatus]}
            </div>}
        </Body>
      </Panel>
    )
  }
}
