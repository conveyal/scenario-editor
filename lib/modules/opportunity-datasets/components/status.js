import distanceInWords from 'date-fns/formatDistanceToNow'
import React from 'react'

import P from 'lib/components/p'
import message from 'lib/message'

const isErrorOrDone = status => status === 'ERROR' || status === 'DONE'

function statusToStyle(status) {
  switch (status) {
    case 'ERROR':
      return 'danger'
    case 'UPLOADING':
    case 'PROCESSING':
      return 'info'
    case 'DONE':
      return 'success'
    default:
      return 'warning'
  }
}

export default function Status(p) {
  return (
    <div className={`alert alert-${statusToStyle(p.status)}`}>
      {isErrorOrDone(p.status) && (
        <button className='close' onClick={p.clear} type='button'>
          &times;
        </button>
      )}
      <P>
        <strong>
          {p.name} ({p.status})
        </strong>
      </P>
      {p.status === 'DONE' && (
        <P>
          {message('opportunityDatasets.finishedUploading', {
            total: `${p.totalGrids}`,
            completedAt: distanceInWords(p.completedAt)
          })}
        </P>
      )}
      {p.status === 'UPLOADING' && (
        <P>
          {message('opportunityDatasets.uploadProgress', {
            createdAt: distanceInWords(p.createdAt),
            completed: `${p.uploadedGrids}`,
            total: `${p.totalGrids}`
          })}
        </P>
      )}
      {p.message && p.message.length > 0 && <P>{p.message}</P>}
    </div>
  )
}
