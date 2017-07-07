// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Link} from 'react-router'

import {Body as PanelBody} from './panel'
import messages from '../utils/messages'

type Props = {
  availableR5Versions?: string[],
  children: ?any,
  project?: {
    description: ?string,
    id: string,
    name: ?string,
    r5Version: string
  },

  loadR5Versions(): void
}

export default class Project extends Component<void, Props, void> {
  componentDidMount () {
    if (!this.props.availableR5Versions) {
      this.props.loadR5Versions()
    }
  }

  render () {
    const {availableR5Versions, children, project} = this.props
    const r5VersionUnsupported = project && availableR5Versions && !availableR5Versions.includes(project.r5Version)

    return project
      ? <div>
        <div
          className='ApplicationDockTitle'
          ><Icon type='cubes' /> {project.name}
        </div>

        <div className='InnerDock'>
          {r5VersionUnsupported &&
            <div className='panel-body'>
              <div className='alert alert-danger' role='alert'>
                {messages.project.versionOutdated} <Link to={`/projects/${project.id}/edit`}>{messages.project.editProject}</Link>
              </div>
            </div>}

          {children}
        </div>
      </div>
      : <PanelBody>{messages.project.loadingProject}</PanelBody>
  }
}
