// @flow
import Icon from '@conveyal/woonerf/components/icon'
import toStartCase from 'lodash/startCase'
import React, {Component} from 'react'
import message from '@conveyal/woonerf/message'

import {Application, Dock, Title} from '../base'
import {Button} from '../buttons'
import {MODIFICATION_TYPES} from '../../constants'
import LabelLayer from '../map/label-layer'
import {IconLink} from '../link'
import Modal, {ModalBody, ModalTitle} from '../modal'
import ModificationsMap from '../../containers/modifications-map'
import ProjectTitle from '../../containers/project-title'
import VariantEditor from '../../containers/variant-editor'
import {Group, Input, Text, Select} from '../input'
import type {Modification, Project} from '../../types'

import ModificationGroup from './group'

type Props = {
  createModification: ({name: string, type: string}) => void,
  modifications: Modification[],
  project: Project,
  projectId: string,

  push: string => void,
  regionId: string,
  updateModification: (modification: Modification) => void
}

type State = {
  filter: string,
  filteredModificationsByType: {
    [type: string]: Modification[]
  },
  showAllOnMap: boolean,
  showCreateModification: boolean
}

export default class ModificationsList extends Component<Props, State> {
  state = {
    filteredModificationsByType: this._filterModifications({
      modifications: this.props.modifications
    }),
    filter: '',
    newModificationName: '',
    newModificationType: MODIFICATION_TYPES[0],
    showAllOnMap: true,
    showCreateModification: false
  }

  componentWillReceiveProps (nextProps: Props) {
    this.setState({
      filteredModificationsByType: this._filterModifications({
        filter: this.state.filter,
        modifications: nextProps.modifications
      })
    })
  }

  _filterModifications ({
    filter,
    modifications
  }: {
    filter?: string,
    modifications: Modification[]
  }) {
    const filterLcase = filter != null ? filter.toLowerCase() : ''
    const filteredModificationsByType = {}

    modifications
      .filter(
        m => filter === null || m.name.toLowerCase().indexOf(filterLcase) > -1
      )
      .forEach(m => {
        filteredModificationsByType[m.type] = [
          ...(filteredModificationsByType[m.type] || []),
          m
        ]
      })

    return filteredModificationsByType
  }

  _createModification = () => {
    const {newModificationName, newModificationType} = this.state
    this.props.createModification({
      name: newModificationName,
      type: newModificationType
    })
    this.setState({
      newModificationName: '',
      newModificationType: MODIFICATION_TYPES[0]
    })
    this._hideCreateModification()
  }

  _showCreateModification = () => {
    this.setState({showCreateModification: true})
  }

  _hideCreateModification = () => {
    this.setState({showCreateModification: false})
  }

  _updateModification = (modification: any) => {
    this.props.updateModification(modification)
  }

  _toggleShowAllOnMap = () => {
    const {modifications} = this.props
    const showAllOnMap = !this.state.showAllOnMap
    this.setState({showAllOnMap})
    modifications.forEach(m =>
      this._updateModification({
        ...m,
        showOnMap: showAllOnMap
      })
    )
  }

  _goToEditModification = (_id: string) => {
    const {push, projectId, regionId} = this.props
    push(`/regions/${regionId}/projects/${projectId}/modifications/${_id}`)
  }

  _setFilter = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const filter = e.target.value && e.target.value.length > 0
      ? e.target.value
      : ''

    this.setState({
      filter,
      filteredModificationsByType: this._filterModifications({
        filter,
        modifications: this.props.modifications
      })
    })
  }

  _map = () =>
    <g>
      <LabelLayer />
      <ModificationsMap />
    </g>

  render () {
    const {projectId, regionId} = this.props
    const {
      filter,
      filteredModificationsByType,
      newModificationName,
      showAllOnMap,
      showCreateModification
    } = this.state
    const showIcon = showAllOnMap ? 'eye' : 'eye-slash'

    return (
      <Application map={this._map}>
        <ProjectTitle />
        <Title>
          <Icon type='pencil' /> Modifications

          <IconLink
            className={`ShowOnMap pull-right ${showAllOnMap ? 'active' : 'dim'} fa-btn`}
            onClick={this._toggleShowAllOnMap}
            title='Toggle all modifications map display'
            type={showIcon}
          />
          <IconLink
            className='pull-right'
            to={`/regions/${regionId}/projects/${projectId}/import-modifications`}
            title={message('project.importModifications')}
            type='upload'
          />
        </Title>

        <Dock>
          <VariantEditor />

          <Group>
            <Button
              block
              onClick={this._showCreateModification}
              style='success'
            >
              <Icon type='plus' /> Create a modification
            </Button>
          </Group>

          <Group>
            <Input
              name={message('modification.filter')}
              onChange={this._setFilter}
              type='text'
              value={filter || ''}
            />
          </Group>

          {MODIFICATION_TYPES.filter(
            type => filteredModificationsByType[type]
          ).map(type => (
            <ModificationGroup
              goToEditModification={this._goToEditModification}
              key={`modification-group-${type}`}
              modifications={filteredModificationsByType[type]}
              projectId={projectId}
              type={type}
              updateModification={this._updateModification}
            />
          ))}
        </Dock>

        {showCreateModification &&
          <Modal onRequestClose={this._hideCreateModification}>
            <ModalTitle>Create new modification</ModalTitle>
            <ModalBody>
              <Select
                label={message('modification.type')}
                onChange={e =>
                  this.setState({newModificationType: e.target.value})}
              >
                {MODIFICATION_TYPES.map(type => (
                  <option key={`type-${type}`} value={type}>
                    {toStartCase(type)}
                  </option>
                ))}
              </Select>
              <Text
                label={message('modification.name')}
                onChange={e =>
                  this.setState({newModificationName: e.target.value})}
              />
              <Button
                block
                disabled={
                  !newModificationName || newModificationName.length === 0
                }
                onClick={this._createModification}
                style='success'
              >
                <Icon type='check' /> {message('common.create')}
              </Button>
            </ModalBody>
          </Modal>}
      </Application>
    )
  }
}
