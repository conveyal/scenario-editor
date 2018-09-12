// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import message from '@conveyal/woonerf/message'

import messages from '../utils/messages'

import {Title} from './base'
import Link, {IconLink} from './link'
import Modal, {ModalBody, ModalTitle} from './modal'

type Props = {
  _id: string,
  downloadScenario: (index: number) => void,
  project?: {
    _id: string,
    bundleId: string,
    name: string,
    regionId: string,
    variants: string[]
  }
}

type State = {
  showExportSelect: boolean,
  showPrintSelect: boolean
}

export default class ProjectTitle extends Component<Props, State> {
  state = {
    showPrintSelect: false,
    showExportSelect: false
  }

  _showExportSelect = () => this.setState({showExportSelect: true})
  _showPrintSelect = () => this.setState({showPrintSelect: true})

  _export = (index: number) => {
    this.props.downloadScenario(index)
  }

  render () {
    const {_id, project} = this.props
    const name = project ? project.name : 'Loading...'
    return (
      <Title>
        <Icon type='cube' /> {name}
        {project &&
          <span>
            <Link
              className='pull-right'
              onClick={this._showPrintSelect}
              title={message('project.print')}
            >
              <Icon type='print' />
              {this.state.showPrintSelect &&
                <SelectScenario
                  label='print'
                  onHide={() => this.setState({showPrintSelect: false})}
                  regionId={project.regionId}
                  projectId={_id}
                  scenarios={project.variants}
                />}
            </Link>
            <Link
              className='pull-right'
              onClick={this._showExportSelect}
              title={message('project.export')}
            >
              <Icon type='download' />
              {this.state.showExportSelect &&
                <SelectScenario
                  action={this._export}
                  label='export'
                  onHide={() => this.setState({showExportSelect: false})}
                  scenarios={project.variants}
                />}
            </Link>
            <IconLink
              className='pull-right'
              title={message('project.editSettings')}
              to={`/regions/${project.regionId}/projects/${_id}/edit`}
              type='gear' />
          </span>}
      </Title>
    )
  }
}

function SelectScenario ({action, regionId, label, onHide, projectId, scenarios}) {
  return (
    <Modal onRequestClose={onHide}>
      <ModalTitle>
        {messages.variant.export} {label}:
      </ModalTitle>
      <ModalBody>
        <ul>
          {scenarios.map((name, index) => (
            <li key={`scenario-${index}`}>
              <a
                onClick={label === 'export' ? () => action(index) : () => {}}
                href={label === 'print' ? `/reports/${regionId}/projects/${projectId}/variants/${index}` : ''}
                tabIndex={0}
                target={label === 'print' ? '_blank' : ''}>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  )
}
