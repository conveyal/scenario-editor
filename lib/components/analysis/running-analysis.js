// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React from 'react'

import ProgressBar from '../progress-bar'

type Props = {
  analysis: any,
  onDelete: () => void
}

export default function RunningAnalysis ({analysis, onDelete}: Props) {
  const complete = analysis.status.complete
  const total = analysis.status.total
  const text = `${analysis.name} - ${complete} of ${total} complete`
  return (
    <li className='list-group-item'>
      <span className='list-group-item-heading'>
        <span>
          <Icon type='cloud' /> {text}
        </span>
        <a
          className='pull-right'
          onClick={onDelete}
          tabIndex={0}
          title='Cancel regional analysis'
        >
          <Icon type='times' />
        </a>
      </span>
      <ProgressBar complete={complete} total={total} />
    </li>
  )
}
