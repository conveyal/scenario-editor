// @flow
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'

import * as actions from './actions'
import * as select from './selectors'

export function fullyConnect (Component: any) {
  return connect(
    createStructuredSelector(select),
    actions
  )(Component)
}

const add0 = (n) => n >= 10 ? n : `0${n}`

export function msToDuration (ms: number) {
  const durationS = Math.floor((Date.now() - ms) / 1000)
  const s = durationS % 60
  const m = Math.floor((durationS / 60) % 60)
  const h = Math.floor((durationS / 60 / 60) % 60)

  return `${add0(h)}:${add0(m)}:${add0(s)}`
}

export function createR5Url (workerCommit: string) {
  return `https://github.com/conveyal/r5/commits/${workerCommit.split('-')[2]}`
}

export function createWorkerUrl (instanceId: string, region: string) {
  return `https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#Instances:instanceId=${instanceId};sort=tag:Name`
}
