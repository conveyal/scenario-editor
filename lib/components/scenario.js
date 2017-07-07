// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Component} from 'react'
import {Link} from 'react-router'

import {Body as PanelBody} from './panel'
import messages from '../utils/messages'

type Props = {
  addComponentToMap(): void,
  bundle?: {
    id: string
  },
  children: any,
  id: string,
  load(string): void,
  loadBundle(string): void,
  loadModifications: ({bundleId: string, scenarioId: string}) => void,
  modifications?: any[],
  scenario?: {
    bundleId: string,
    id: string,
    name: string,
    projectId: string
  },
  setCurrentScenario(any): void
}

export default class Scenario extends Component<void, Props, void> {
  componentDidMount () {
    const {id, load} = this.props
    load(id)
  }

  componentWillUnmount () {
    this.props.setCurrentScenario()
  }

  _dropSinglePointPin = (e: Event) => {
    e.preventDefault()
    this.props.addComponentToMap()
  }

  render () {
    const {bundle, children, id, modifications, scenario} = this.props
    return scenario
      ? <div>
        <div
          className='ApplicationDockTitle'
          ><Icon type='cube' /> {scenario.name}
          <Link
            className='pull-right'
            title={messages.scenario.editName}
            to={`/scenarios/${id}/edit`}
            ><Icon type='gear' />
          </Link>
          <Link
            className='pull-right'
            to={`/scenarios/${id}/import-shapefile`}
            title={messages.scenario.importShapefile}
            ><Icon type='globe' />
          </Link>
          <Link
            className='pull-right'
            to={`/scenarios/${id}/import-modifications`}
            title={messages.scenario.importModifications}
            ><Icon type='upload' />
          </Link>
        </div>
        <div className='InnerDock'>
          {bundle && modifications
            ? <div className='ScenarioContent'>{children}</div>
            : <PanelBody>{messages.scenario.loadingGTFS}</PanelBody>}
        </div>
      </div>
      : <PanelBody>{messages.scenario.loading}</PanelBody>
  }
}
