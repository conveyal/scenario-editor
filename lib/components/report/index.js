// @flow
import message from '@conveyal/woonerf/message'
import React, {Component} from 'react'

import type {
  Bundle,
  Feed,
  Modification,
  Project,
  Stop,
  Timetable
} from '../../types'

import ModificationComponent from './modification'

type Props = {
  allFeedIds: string[],
  bundle?: Bundle,
  feedScopedStops: Stop[],
  feedsById: {
    [id: string]: Feed
  },
  loadProject: (string) => void,
  loadRegion: (string) => void,
  modifications?: Modification[],
  project?: Project,
  projectId: string,
  projectTimetables: Timetable[],
  regionId: string,
  variant: string
}

function alertOnError (error: {message?: string, reason?: string}) {
  window.alert(
    `Error while rendering report! ${error.message || error.reason || ''}`
  )
}

/**
 * Main report generation component
 */
export default class Report extends Component<void, Props, void> {
  componentWillMount () {
    window.addEventListener('error', alertOnError)
    window.addEventListener('unhandledrejection', alertOnError)
  }

  componentDidMount () {
    const {loadProject, loadRegion, regionId, projectId} = this.props
    loadProject(projectId)
    loadRegion(regionId)
  }

  render () {
    const {
      allFeedIds,
      modifications,
      feedsById,
      project,
      bundle,
      variant,
      projectTimetables,
      feedScopedStops
    } = this.props

    if (!modifications || !project || !bundle) {
      return <div />
    }

    if (!allFeedIds.every(feedId => !!feedsById[feedId])) return <div />

    return (
      <div className='container' id='report'>
        <div className='row'>
          <div className='col-md-6 col-offset-2' style={{float: 'none'}}>
            <h1>
              {project.name}
            </h1>
            <h2>
              {message('report.variant', {variant})}
            </h2>
            {message('report.bundle', {name: bundle.name})}

            {/* TODO have a map of all modifications here */}

            {modifications.map((mod, index) => (
              <ModificationComponent
                key={mod._id}
                modification={mod}
                feedsById={feedsById}
                projectTimetables={projectTimetables}
                feedScopedStops={feedScopedStops}
                index={index + 1} // correct for 0-based array indices
                total={modifications.length}
              />
            ))}
            <i>
              Map data:{' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: process.env.LEAFLET_ATTRIBUTION
                }}
              />
            </i>
          </div>
        </div>
      </div>
    )
  }
}
