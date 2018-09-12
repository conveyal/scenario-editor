// @flow
import React, {PureComponent} from 'react'
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'

import type {Project} from '../types'

import {Application, Dock, Title} from './base'
import {Button} from './buttons'
import {Group as FormGroup, Text} from './input'

type Props = {
  bundleName: string,
  close: (any) => void,

  deleteProject: (project: any) => void,
  project: Project,
  save: (any) => void
}

export default class EditProject extends PureComponent<Props> {
  state = {
    name: this.props.project.name
  }

  componentWillReceiveProps (newProps: Props) {
    this.setState({name: newProps.project.name})
  }

  _deleteProject = () => {
    if (window.confirm(message('project.deleteConfirmation'))) {
      this.props.deleteProject()
    }
  }

  _save = () => {
    const {close, project, save} = this.props
    const {name} = this.state
    if (name) {
      save({...project, name})
      close()
    }
  }

  render () {
    return (
      <Application>
        <Title>
          {message('project.editSettings')}
        </Title>
        <Dock>
          <Text
            name={message('project.name')}
            onChange={e => this.setState({name: e.target.value})}
            value={this.state.name}
          />
          <FormGroup>
            <strong>Bundle:</strong> {this.props.bundleName} <br />
            <small>Bundle cannot be changed once a project is created</small>
          </FormGroup>
          <Button
            block
            onClick={this._save}
            style='success'
          >
            <Icon type='save' /> {message('project.editAction')}
          </Button>
          <Button
            block
            onClick={this._deleteProject}
            style='danger'
          >
            <Icon type='trash' /> {message('project.delete')}
          </Button>
        </Dock>
      </Application>
    )
  }
}
