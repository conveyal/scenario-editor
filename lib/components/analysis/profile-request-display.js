import {
  faBicycle,
  faCar,
  faCreditCard,
  faWalking
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import message from 'lib/message'
import {secondsToHhMmString} from 'lib/utils/time'

import Icon from '../icon'
import Link from '../link'
import * as Panel from '../panel'

/** Display the parameters of a profile request */
export default function ProfileRequestDisplay(p) {
  const hasTransit = p.transitModes !== ''
  return (
    <div className='PRD'>
      <style global jsx>{`
        .PRD > .panel {
          margin-bottom: 0;
        }
      `}</style>
      <Panel.Collapsible
        heading={() => p.name}
        defaultExpanded={p.defaultExpanded}
      >
        <table className='table table-condensed table-striped'>
          <tbody>
            <tr>
              <th>Resources</th>
              <td>
                <Link
                  to='bundleEdit'
                  regionId={p.regionId}
                  bundleId={p.bundleId}
                >
                  <a>GTFS Bundle</a>
                </Link>
                &nbsp;/&nbsp;
                <Link
                  to='modifications'
                  regionId={p.regionId}
                  projectId={p.projectId}
                >
                  <a>Project</a>
                </Link>
              </td>
            </tr>
            <tr>
              <th>{message('r5Version.title')}</th>
              <td>{p.workerVersion}</td>
            </tr>
            <tr>
              <th>{message('analysis.date')}</th>
              <td>{p.date}</td>
            </tr>
            <tr>
              <th>{message('analysis.fromTime')}</th>
              <td>{secondsToHhMmString(p.fromTime)}</td>
            </tr>
            <tr>
              <th>{message('analysis.toTime')}</th>
              <td>{secondsToHhMmString(p.toTime)}</td>
            </tr>
            <tr>
              <th>{message('analysis.transfers')}</th>
              {/* Max transfers is max rides - 1 */}
              <td>{p.maxRides - 1}</td>
            </tr>
            <tr>
              <th>{message('analysis.monteCarloDraws')}</th>
              <td>{p.monteCarloDraws}</td>
            </tr>
            <tr>
              <th>{message('analysis.accessModes')}</th>
              <td>
                <Modes modes={hasTransit ? p.accessModes : p.directModes} />
              </td>
            </tr>
            <tr>
              <th>{message('analysis.modes.transit')}</th>
              <td>
                {hasTransit ? message('common.yes') : message('common.no')}
              </td>
            </tr>
          </tbody>
        </table>
      </Panel.Collapsible>
    </div>
  )
}

/**
 * Render a mode set
 */
function Modes({modes}) {
  return (
    <>
      {modes.split(',').map(mode => {
        switch (mode) {
          case 'WALK':
            return (
              <span key={mode} title={message('analysis.modes.walk')}>
                <Icon icon={faWalking} />
              </span>
            )
          case 'BICYCLE':
            return (
              <span key={mode} title={message('analysis.modes.bicycle')}>
                <Icon icon={faBicycle} />
              </span>
            )
          case 'CAR':
            return (
              <span key={mode} title={message('analysis.modes.car')}>
                <Icon icon={faCar} />
              </span>
            )
          case 'BICYCLE_RENT':
            return (
              <span
                key={mode}
                className='fa-layers fa-fw'
                title={message('analysis.modes.bicycleRent')}
              >
                <Icon icon={faBicycle} />
                <Icon icon={faCreditCard} />
              </span>
            )
          case 'CAR_PARK':
            // TODO non-ideal parking icon
            return (
              <b key={mode} title={message('analysis.modes.carPark')}>
                P
              </b>
            )
        }
      })}
    </>
  )
}
