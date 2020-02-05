import {
  faChartArea,
  faPlus,
  faSync,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'

import message from 'lib/message'

import {Button} from '../buttons'
import Icon from '../icon'

export default function AnalysisTitle(p) {
  const isFetchingIsochrone = !!p.isochroneFetchStatus
  return (
    <div className='ApplicationDockTitle' style={{width: '640px'}}>
      <div>
        <Icon icon={faChartArea} />{' '}
        {isFetchingIsochrone ? p.isochroneFetchStatus : 'Analysis'}
      </div>
      <div>
        {isFetchingIsochrone && (
          <Button
            className='pull-right'
            onClick={p.abortFetchTravelTimeSurface}
            size='sm'
            style='danger'
          >
            <Icon icon={faTimes} /> Abort
          </Button>
        )}
        {!isFetchingIsochrone && (
          <Button
            className='pull-right'
            disabled={p.disableFetchTravelTimeSurface}
            onClick={p.fetchTravelTimeSurface}
            size='sm'
            style='primary'
            title={
              p.disableFetchTravelTimeSurface
                ? message('analysis.disableFetch')
                : ''
            }
          >
            <Icon icon={faSync} /> {message('analysis.refresh')}
          </Button>
        )}
        {!isFetchingIsochrone && (
          <Button
            className='pad-right pull-right'
            disabled={p.disableCreateRegionalAnalysis}
            size='sm'
            style='success'
            onClick={p.createRegionalAnalysis}
            title={
              p.disableCreateRegionalAnalysis
                ? message('analysis.disableRegionalAnalysis')
                : ''
            }
          >
            <Icon icon={faPlus} />
            {message('analysis.newRegionalAnalysis')}
          </Button>
        )}
      </div>
    </div>
  )
}
