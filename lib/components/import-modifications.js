// @flow
import message from '@conveyal/woonerf/message'
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'
import Select from 'react-select'

import ProjectTitle from '../containers/project-title'
import type {Project} from '../types'

import {Application, Dock} from './base'
import {Button} from './buttons'

type Props = {
  copyFromProject: ({
    fromProjectId: string,
    toProjectId: string
  }) => void,
  projects: Project[],
  push: string => void,
  regionId: string,
  toProjectId: string
}

type State = {
  importProjectId?: string
}

export default class ImportModifications extends PureComponent<Props, State> {
  state = {}

  _goToImportShapefile = () => {
    const {push, toProjectId, regionId} = this.props
    push(`/regions/${regionId}/projects/${toProjectId}/import-shapefile`)
  }

  _copyModificationsFromProject = () => {
    const {copyFromProject, toProjectId} = this.props
    const {importProjectId} = this.state
    if (importProjectId) {
      copyFromProject({
        fromProjectId: importProjectId,
        toProjectId
      })
    }
  }

  _setImportProjectId = (project: {value: string}) => {
    this.setState({importProjectId: project.value})
  }

  render () {
    const {projects} = this.props
    const {importProjectId} = this.state
    return (
      <Application>
        <ProjectTitle />
        <Dock>
          <h5>{message('modification.importFromShapefile')}</h5>
          <Button
            block
            onClick={this._goToImportShapefile}
            style='success'
          >
            <Icon type='upload' /> {message('project.importAction')}
          </Button>
          <br />
          <h5>{message('modification.importFromProject')}</h5>
          <p>{message('modification.importFromProjectInfo')}</p>
          <div className='form-group'>
            <Select
              clearable={false}
              onChange={this._setImportProjectId}
              options={projects.map(p => ({value: p._id, label: p.name}))}
              placeholder={message('project.select')}
              value={importProjectId}
            />
          </div>
          <Button
            block
            disabled={!importProjectId}
            onClick={this._copyModificationsFromProject}
            style='success'
          >
            <Icon type='copy' /> {message('project.importAction')}
          </Button>
        </Dock>
      </Application>
    )
  }
}
