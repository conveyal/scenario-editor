// @flow
import React from 'react'

import * as utils from '../utils'

import JobDashboard from './job-dashboard'
import WorkerDashboard from './worker-dashboard'

class MainDashboard extends React.PureComponent {
  render () {
    const p = this.props
    return <div className='AdminDashboard'>
      <h3>jobs ({p.jobs.filter(j => j.jobId !== 'SUM').length})</h3>
      <JobDashboard />
      <h3>workers ({p.workers.length})</h3>
      <WorkerDashboard />
    </div>
  }
}

export default utils.fullyConnect(MainDashboard)
