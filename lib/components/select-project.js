// @flow
import message from '@conveyal/woonerf/message'
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Link} from 'react-router'

import type {Region} from '../types'

import {Application, Dock, Title} from './base'
import {ButtonLink} from './buttons'
import {Group} from './input'

type Props = {
  projects: Array<{_id: string, name: string}>,
  region: Region
}

function Status ({code}: {code: string}) {
  switch (code) {
    case 'DONE':
      return <span />
    case 'ERROR':
      return <div className='alert alert-danger'>{message('region.statusCode.ERROR')}</div>
    default:
      return <div className='alert alert-info'><Icon type='spinner' className='fa-spin' /> {message(`region.statusCode.${code}`)}</div>
  }
}

export default class SelectProject extends Component<Props> {
  render () {
    const {region, projects} = this.props
    return (
      <Application>
        <Title><Icon type='map-o' /> {region.name}</Title>
        <Dock>
          {region.statusCode && <Status code={region.statusCode} />}

          <Group>
            {region.bundles && region.bundles.length > 0
              ? <ButtonLink
                block
                style='success'
                to={`/regions/${region._id}/create-project`}
                title={message('project.createAction')}
              >
                <Icon type='plus' /> {message('project.createAction')}
              </ButtonLink>
              : <ButtonLink
                block
                style='success'
                to={`/regions/${region._id}/bundles/create`}
                title={message('project.uploadBundle')}
              >
                <Icon type='database' /> {message('project.uploadBundle')}
              </ButtonLink>
            }
          </Group>
          {projects.length > 0 &&
            <div>
              <p className='center'>
                {message('project.goToExisting')}
              </p>
              <div className='list-group'>
                {projects.map(project => (
                  <Link
                    className='list-group-item'
                    key={project._id}
                    to={`/regions/${region._id}/projects/${project._id}`}
                    title={message('project.goToProject')}
                  >
                    <Icon type='cube' /> {project.name}
                  </Link>
                ))}
              </div>
            </div>}
        </Dock>
      </Application>
    )
  }
}
