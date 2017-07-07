// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Link} from 'react-router'

import {Button} from './buttons'
import {Group} from './input'
import messages from '../utils/messages'
import {Body} from './panel'

type Props = {
  loadAllProjects(): void,
  projects: Array<{id: string, name: string}>,
  push(string): void
}

export default class SelectProject extends Component<void, Props, void> {
  componentDidMount () {
    this.props.loadAllProjects()
  }

  render () {
    const {projects, push} = this.props
    return (
      <div className='InnerDock'>
        <Body>
          <div className='WelcomeTitle'>
            <p style={{textAlign: 'center'}}>{messages.project.welcome}</p>
            <span className='logo' to='/'>conveyal analysis </span>
            <span className='badge'>beta</span>
          </div>
          <Group>
            <Button
              block
              onClick={() => push(`/projects/create`)}
              style='success'
              ><Icon type='cubes' /> {messages.project.createAction}
            </Button>
          </Group>
          {projects.length > 0 &&
            <div>
              <p style={{textAlign: 'center'}}>{messages.project.goToExisting}</p>
              {projects.map((project) =>
                <Link
                  className='BlockLink'
                  key={project.id}
                  to={`/projects/${project.id}`}
                  title={messages.project.goToProject}
                  ><Icon type='cubes' /> {project.name}
                </Link>)}
            </div>}
        </Body>
      </div>
    )
  }
}
