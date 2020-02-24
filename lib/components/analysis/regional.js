import {
  faDownload,
  faPencilAlt,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import fetchAction from 'lib/actions/fetch'
import {updateRegionalAnalysis} from 'lib/actions/analysis/regional'
import {API} from 'lib/constants'
import message from 'lib/message'
import selectCutoff from 'lib/selectors/regional-display-cutoff'
import selectPercentile from 'lib/selectors/regional-display-percentile'

import {Button, Group} from '../buttons'
import Icon from '../icon'

import ProfileRequestDisplay from './profile-request-display'
import RunningAnalysis from './running-analysis'

const AggregationArea = dynamic(() => import('../map/aggregation-area'), {
  ssr: false
})
const AnalysisBounds = dynamic(() => import('../map/analysis-bounds'), {
  ssr: false
})
const DotMap = dynamic(
  () => import('lib/modules/opportunity-datasets/components/dotmap'),
  {ssr: false}
)
const RegionalLayer = dynamic(() => import('../map/regional'), {
  ssr: false
})
const RegionalResults = dynamic(() => import('./regional-results'), {
  ssr: false
})

function isComplete(analysis) {
  const status = get(analysis, 'status')
  return status == null || get(status, 'complete') === get(status, 'total')
}

export default function Regional(p) {
  const dispatch = useDispatch()
  const cutoff = useSelector(selectCutoff)
  const percentile = useSelector(selectPercentile)
  const {analysis, setMapChildren} = p

  React.useEffect(() => {
    setMapChildren(() =>
      !isComplete(analysis) ? (
        <AnalysisBounds analysis={analysis} />
      ) : (
        <>
          <DotMap />
          <RegionalLayer />
          <AggregationArea />
        </>
      )
    )
    return () => setMapChildren(() => <React.Fragment />)
  }, [analysis, setMapChildren])

  /**
   * Perform an authenticated fetch to get a presigned URL to download a grid
   * from S3, then download it. Pass in the path to fetch.
   */
  function _downloadProjectGIS(e) {
    e.preventDefault()
    dispatch(
      fetchAction({
        url: `${API.Regional}/${p.analysis._id}/grid/tiff?cutoff=${cutoff}&percentile=${percentile}`
      })
    ).then(value => {
      window.open(value.url)
    })
  }

  function _renameAnalysis() {
    const name = window.prompt('Please enter a new name', p.analysis.name)
    if (name != null && name !== p.analysis.name) {
      dispatch(updateRegionalAnalysis({...analysis, name}))
    }
  }

  return (
    <>
      <ProfileRequestDisplay
        defaultExpanded
        {...p.analysis}
        {...p.analysis.request}
      />

      <Group justified>
        <Button onClick={_renameAnalysis} size='sm' style='warning'>
          <Icon icon={faPencilAlt} />{' '}
          {message('analysis.renameRegionalAnalysis')}
        </Button>
        <Button onClick={p.deleteAnalysis} size='sm' style='danger'>
          <Icon icon={faTrash} /> {message('analysis.deleteRegionalAnalysis')}
        </Button>
      </Group>

      <br />

      {isComplete(p.analysis) ? (
        <>
          <label className='control-label'>
            {message('analysis.gisExport')}
          </label>
          <Button block onClick={_downloadProjectGIS} size='sm' style='info'>
            <Icon icon={faDownload} />{' '}
            {message('analysis.downloadRegional', {
              name: p.analysis.name
            })}
          </Button>

          <br />

          <RegionalResults
            analysisId={p.analysis._id}
            regionId={p.analysis.regionId}
            {...p}
          />
        </>
      ) : (
        <RunningAnalysis analysis={p.analysis} onDelete={p.deleteAnalysis} />
      )}
    </>
  )
}
