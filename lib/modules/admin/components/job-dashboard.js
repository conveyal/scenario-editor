// @flow
import Icon from '@conveyal/woonerf/components/icon'
import format from 'date-fns/format'
import React from 'react'

import {REFRESH_INTERVAL_MS, START_TIME_FORMAT} from '../constants'
import type {Job} from '../types'
import * as utils from '../utils'

const formatStartTime = (ms: number) =>
  format(ms, START_TIME_FORMAT)

class JobDashboard extends React.PureComponent {
  props: {
    allBundlesById: Object,
    jobs: Job[],

    fetchJobs: () => void
  }

  _fetchJobsIntervalId: number
  componentDidMount () {
    this.props.fetchJobs()
    this._fetchJobsIntervalId = setInterval(() =>
      this.props.fetchJobs(),
      REFRESH_INTERVAL_MS)
  }

  componentWillUnmount () {
    clearInterval(this._fetchJobsIntervalId)
  }

  render () {
    const p = this.props
    return <table className='JobTable table'>
      <thead>
        <tr>
          <th><Icon type='hashtag' /> name</th>
          <th><Icon type='database' /> bundle</th>
          <th><Icon type='users' /> owner</th>
          <th><Icon type='code-fork' /> worker version</th>
          <th><Icon type='cubes' /> resources</th>
          <th><Icon type='calendar' /> created at</th>
          <th><Icon type='clock-o' /> duration</th>
          <th><Icon type='map-o' /> taui</th>
          <th><Icon type='hourglass-half' /> progress</th>
        </tr>
      </thead>
      <tbody>
        {p.jobs.filter(j => j.jobId !== 'SUM').map(j =>
          <JobRow
            key={j.jobId}
            bundle={p.allBundlesById[j.regionalAnalysis.bundleId]}
            {...j}
          />)}
      </tbody>
    </table>
  }
}

class JobRow extends React.PureComponent {
  render () {
    const p = this.props

    const owner = `${p.regionalAnalysis.createdBy} (${p.regionalAnalysis.accessGroup})`
    const name = p.regionalAnalysis.name
    const createdAt = formatStartTime(p.regionalAnalysis.createdAt)
    const duration = utils.msToDuration(p.regionalAnalysis.createdAt)
    const {bundleId, projectId, regionId} = p.regionalAnalysis

    const bundleName = p.bundle ? p.bundle.name : bundleId
    const makeStatic = p.regionalAnalysis.request.makeStaticSite

    return <tr
      className='JobRow'
    >
      <td className='JobName' title={name}>
        <a href={`/projects/${projectId}/regional/${p.regionalAnalysis._id}`}>{name}</a>
      </td>
      <td className='JobBundle' title={`Bundle ${bundleName}`}>
        <a href={`/regions/${regionId}/bundles/${bundleId}`}>
          {bundleName}
        </a>
      </td>
      <td className='JobOwner' title={`Created by ${owner}`}>{owner}</td>
      <td className='JobWorkerVersion'>
        {p.workerCommit === 'UNKNOWN'
          ? 'UNKNOWN'
          : <a
            href={utils.createR5Url(p.workerCommit)}
            target='_blank'
            >{p.workerCommit}</a>}
      </td>
      <td className='JobProject'>
        <a href={`/projects/${projectId}`}>project</a>&nbsp;|&nbsp;
        <a href={`/regions/${regionId}`}>region</a>
      </td>
      <td className='JobStarted' title={`created at ${createdAt}`}>{createdAt}</td>
      <td className='JobDuration' title={duration}>{duration}</td>
      <td title='Making Static Site?'>{makeStatic ? 'Y' : 'N'}</td>
      <td className='JobProgress' title={`${p.complete} / ${p.total} tasks completed`}>
        {p.complete} / {p.total} complete ({p.deliveries - p.complete} delivered)
      </td>
    </tr>
  }
}

export default utils.fullyConnect(JobDashboard)
