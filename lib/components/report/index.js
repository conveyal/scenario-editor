/** Main report generation component */

import React, { Component, PropTypes } from 'react'
import Modification from './modification'
import {sprintf} from 'sprintf-js'

import messages from '../../utils/messages'

export default class Report extends Component {
  static propTypes = {
    scenarioId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    modifications: PropTypes.array,
    scenario: PropTypes.object,
    bundle: PropTypes.object,
    feedsById: PropTypes.object,
    variant: PropTypes.string.isRequired,
    loadScenario: PropTypes.func.isRequired,
    loadProject: PropTypes.func.isRequired,
    feedScopedStops: PropTypes.array.isRequired,
    scenarioTimetables: PropTypes.array.isRequired
  }

  componentWillMount () {
    const { loadScenario, loadProject, projectId, scenarioId } = this.props
    loadScenario(scenarioId)
    loadProject(projectId)
  }

  render () {
    const { modifications, feedsById, scenario, bundle, variant, scenarioTimetables, feedScopedStops } = this.props

    if (modifications == null || scenario == null || bundle == null) return <div />

    // ensure all feeds are loaded
    const allFeedIds = [...new Set([
      ...modifications.filter(m => m.feed).map(m => m.feed),
      ...modifications
        .filter(m => m.entries || m.timetables)
        .map(m => m.entries || m.timetables)
        .map(tts =>
          // if phasing existed and then is cleared, only the phaseAtStop is cleared so that it can be
          // re-enabled easily, hence use phaseAtStop to check for presence of phasing
          tts.filter(tt => tt.phaseAtStop)
          .map(tt => [tt.phaseAtStop.split(':')[0], tt.phaseFromStop.split(':')[0]])
          .reduce((arr, tt) => [...arr, ...tt], [])
        )
        .reduce((arr, val) => [...arr, ...val], [])
    ])]

    if (!allFeedIds.every(feedId => !!feedsById[feedId])) return <div />

    return <div className='container' id='report'>
      <div className='row'>
        <div className='col-md-6 col-offset-2' style={{ float: 'none' }}>

          <h1>{scenario.name}</h1>
          <h2>{sprintf(messages.report.variant, variant)}</h2>
          {sprintf(messages.report.bundle, bundle.name)}

          {/* TODO it'd be really cool to have a map of all modifications here but the scenario editor is not yet fast enough */}

          {modifications.map((mod, index, arr) => <Modification
            modification={mod}
            feedsById={feedsById}
            scenarioTimetables={scenarioTimetables}
            feedScopedStops={feedScopedStops}
            index={index + 1} // correct for 0-based array indices
            total={arr.length}
          />)}
          <i>Map data: <span dangerouslySetInnerHTML={{__html: process.env.LEAFLET_ATTRIBUTION}} /></i>
        </div>
      </div>
    </div>
  }
}
