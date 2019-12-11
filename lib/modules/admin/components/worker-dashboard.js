import {
  faBolt,
  faClock,
  faCodeBranch,
  faDatabase,
  faExclamationCircle,
  faMicrochip,
  faTachometerAlt,
  faTasks
} from '@fortawesome/free-solid-svg-icons'
import classnames from 'classnames'
import distanceInWordsToNow from 'date-fns/formatDistanceToNow'
import _max from 'lodash/max'
import _sortBy from 'lodash/sortBy'
import React from 'react'

import Icon from 'lib/components/icon'

import {REFRESH_INTERVAL_MS} from '../constants'
import * as utils from '../utils'

import WorkerSparkline from './sparkline'

const bytesToGB = bytes => (bytes * 1e-9).toFixed(2)

function WorkerDashboard(p) {
  const workers = _sortBy(p.workers, p.workersSortBy)

  const {fetchWorkers} = p
  React.useEffect(() => {
    let timeoutId
    function refreshWorkers() {
      fetchWorkers()
      timeoutId = setTimeout(() => refreshWorkers(), REFRESH_INTERVAL_MS)
    }
    refreshWorkers()
    return () => clearTimeout(timeoutId)
  }, [fetchWorkers])

  return (
    <div className='WorkerDashboard'>
      <div className='Workers'>
        {workers.map(w => (
          <WorkerCell
            key={w.workerId}
            maxLoad={p.maxLoad}
            maxTasksPerMinute={p.maxTasksPerMinute}
            {...w}
          />
        ))}
      </div>
    </div>
  )
}

function WorkerCell(p) {
  const [sparklineWidth, setSparklineWidth] = React.useState(400)
  const workerRef = React.useRef()
  React.useEffect(() => {
    setSparklineWidth(workerRef.current.offsetWidth - 190)
  }, [workerRef])

  const staleMs = Date.now() - p.lastSeenAt
  const currentTasksPerMinute = p.taskHistory[p.taskHistory.length - 1]

  const active = currentTasksPerMinute > 0
  const stale = staleMs > REFRESH_INTERVAL_MS * 3
  const dead = staleMs > REFRESH_INTERVAL_MS * 10

  const workerClassNames = classnames('Worker', {
    active,
    stale,
    dead
  })

  const duration = utils.msToDuration(p.jvmStartTime * 1000)
  const lastSeenAt = distanceInWordsToNow(p.lastSeenAt, {addSuffix: true})
  const maxLoad = _max([p.processors, p.maxLoad])
  const sparklineTdStyle = {width: `${sparklineWidth}px`}

  return (
    <div className={workerClassNames} ref={workerRef}>
      {p.ec2instanceId && (
        <div>
          <Icon icon={faBolt} />
          &nbsp;
          <a
            href={utils.createWorkerUrl(p.ec2instanceId, p.ec2region)}
            rel='noopener noreferrer'
            target='_blank'
          >
            {p.ec2instanceId}
          </a>
        </div>
      )}
      {p.workerVersion !== 'UNKNOWN' && (
        <div>
          <Icon icon={faCodeBranch} />
          &nbsp;
          <a
            href={utils.createR5Url(p.workerVersion)}
            target='_blank'
            rel='noopener noreferrer'
          >
            {p.workerVersion}
          </a>
        </div>
      )}
      {p.bundles &&
        p.bundles.length > 0 &&
        p.bundles.map(b => (
          <div key={b._id}>
            <Icon icon={faDatabase} />
            &nbsp;
            <a
              href={`/regions/${b.regionId}/bundles/${b._id}`}
              rel='noopener noreferrer'
              target='_blank'
            >
              {b.name} ({b.accessGroup})
            </a>
          </div>
        ))}
      <div title={`Running for ${duration} (hh:mm:ss)`}>
        <Icon icon={faClock} /> {duration}
      </div>
      <table className='Bottom'>
        <tbody>
          <tr className='WorkerSparkline' title='Memory Usage'>
            <td className='SparklineTitle'>
              <Icon icon={faMicrochip} />
            </td>
            <td className='Sparkline' style={sparklineTdStyle}>
              <WorkerSparkline
                data={p.memoryHistory}
                max={p.memoryMax}
                width={sparklineWidth}
              />
            </td>
            <td className='SparklineValue'>
              {bytesToGB(p.memoryMax - p.memoryFree)} / {bytesToGB(p.memoryMax)}{' '}
              GB
            </td>
          </tr>
          <tr className='WorkerSparkline' title='Load'>
            <td className='SparklineTitle'>
              <Icon icon={faTachometerAlt} />
            </td>
            <td className='Sparkline' style={sparklineTdStyle}>
              <WorkerSparkline
                data={p.loadHistory}
                reference={maxLoad > p.processors ? p.processors : 0}
                max={maxLoad}
                width={sparklineWidth}
              />
            </td>
            <td className='SparklineValue'>
              {p.loadAverage.toFixed(2)} / {p.processors} cores
            </td>
          </tr>
          <tr className='WorkerSparkline' title='Tasks per minute'>
            <td className='SparklineTitle'>
              <Icon icon={faTasks} />
            </td>
            <td className='Sparkline' style={sparklineTdStyle}>
              <WorkerSparkline
                data={p.taskHistory}
                max={p.maxTasksPerMinute}
                width={sparklineWidth}
              />
            </td>
            <td className='SparklineValue'>
              {currentTasksPerMinute} tasks / min
            </td>
          </tr>
        </tbody>
      </table>

      {staleMs > REFRESH_INTERVAL_MS * 5 && (
        <div>
          <Icon icon={faExclamationCircle} /> last seen {lastSeenAt}
        </div>
      )}
    </div>
  )
}

export default utils.fullyConnect(WorkerDashboard)
