import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'

import * as actions from './actions'
import * as select from './selectors'

export function fullyConnect(Component) {
  return connect(createStructuredSelector(select), actions)(Component)
}

const add0 = n => (n >= 10 ? n : `0${n}`)

export function msToDuration(ms) {
  const durationS = Math.floor((Date.now() - ms) / 1000)
  const s = durationS % 60
  const m = Math.floor((durationS / 60) % 60)
  const h = Math.floor((durationS / 60 / 60) % 60)

  return `${add0(h)}:${add0(m)}:${add0(s)}`
}

/**
 * Example commit string: "v3.4.0-118-gbe7199c". Take the last section after
 * splitting on the hyphens and remove the "g".
 */
const githubUrl = 'https://github.com/conveyal/r5/commits'
export function createR5Url(workerCommit) {
  // not a release version
  if (workerCommit.indexOf('-') !== -1) {
    const hash = workerCommit.split('-')[2].slice(1) //
    return `${githubUrl}/${hash}`
  }
  return `${githubUrl}/${workerCommit}`
}

export function createWorkerUrl(instanceId, region) {
  return `https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#Instances:instanceId=${instanceId};sort=tag:Name`
}

const C1 = '#2389c9'
const C2 = '#36c923'
const C3 = '#aab4bb'

/**
 * Create a progress bar with a linear-gradient.
 */
export function createLinearGradientForJob(c, d, t) {
  const p1 = (c / t) * 100
  const p2 = (d / t) * 100
  return `linear-gradient(to right,
    ${C1} 0%,
    ${C1} ${p1}%,
    ${C2} ${p1}%,
    ${C2} ${p2}%,
    ${C3} ${p2}%,
    ${C3} 100%)`
}
