// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Link} from 'react-router'

import {Group} from './input'
import messages from '../utils/messages'
import {Body} from './panel'

type Props = {
  projectId: string,
  scenarios: Array<{id: string, name: string}>
}

export default class SelectScenario extends Component<void, Props, void> {
  render () {
    const {projectId, scenarios} = this.props
    const btn = `btn btn-block btn`
    return (
      <Body>
        <Group>
          <Link
            className={`${btn}-success`}
            to={`/projects/${projectId}/scenarios/create`}
            title={messages.scenario.createAction}
            ><Icon type='cube' /> {messages.scenario.createAction}
          </Link>
          <Link
            className={`${btn}-success`}
            to={`/projects/${projectId}/bundles/create`}
            title={messages.scenario.uploadBundle}
            ><Icon type='database' /> {messages.scenario.uploadBundle}
          </Link>
          <Link
            className={`${btn}-success`}
            to={`/projects/${projectId}/grids/create`}
            title={messages.scenario.uploadOpportunityDataset}
            ><Icon type='th' /> {messages.scenario.uploadOpportunityDataset}
          </Link>
          <Link
            className={`${btn}-warning`}
            to={`/projects/${projectId}/edit`}
            title={messages.project.configure}
            ><Icon type='gear' /> {messages.project.configure}
          </Link>
        </Group>

        {scenarios.length > 0 &&
          <div>
            <p className='center'>{messages.scenario.goToExisting}</p>
            {scenarios.map((scenario) =>
              <Link
                className='BlockLink'
                key={scenario.id}
                to={`/scenarios/${scenario.id}`}
                title={messages.scenario.goToScenario}
                ><Icon type='cube' /> {scenario.name}
              </Link>)}
          </div>}
      </Body>
    )
  }
}
