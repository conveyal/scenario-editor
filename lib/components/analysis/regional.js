import {
  faDownload,
  faPencilAlt,
  faTrash
} from '@fortawesome/free-solid-svg-icons'
import lonlat from '@conveyal/lonlat'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import React from 'react'

import {API} from 'lib/constants'
import message from 'lib/message'

import {Button, Group} from '../buttons'
import Icon from '../icon'

import ProfileRequestDisplay from './profile-request-display'
import RegionalResults from './regional-results'
import RunningAnalysis from './running-analysis'

const AggregationArea = dynamic(() => import('../map/aggregation-area'), {
  ssr: false
})
const DotMap = dynamic(
  () => import('lib/modules/opportunity-datasets/components/dotmap'),
  {ssr: false}
)
const RegionalLayer = dynamic(() => import('../map/regional'), {
  ssr: false
})
const Rectangle = dynamic(
  () => import('react-leaflet').then(l => l.Rectangle),
  {
    ssr: false
  }
)

export default class RegionalAnalysis extends React.PureComponent {
  componentDidMount() {
    this._renderMap()
  }

  componentWillUnmount() {
    this.props.setMapChildren(<React.Fragment />)
  }

  /**
   * Perform an authenticated fetch to get a presigned URL to download a grid
   * from S3, then download it. Pass in the path to fetch.
   */
  _downloadProjectGIS = e => {
    e.preventDefault()
    const p = this.props
    p.fetch({
      url: `${API.Regional}/${p.analysis._id}/grid/tiff?cutoff=${p.cutoff}&percentile=${p.percentile}`
    }).then(value => {
      window.open(value.url)
    })
  }

  _renameAnalysis = () => {
    const analysis = this.props.analysis
    const name = window.prompt('Please enter a new name', analysis.name)
    if (name != null && name !== analysis.name) {
      this.props.updateRegionalAnalysis({...analysis, name})
    }
  }

  _isComplete() {
    const {analysis} = this.props
    const status = get(analysis, 'status')
    return status == null || get(status, 'complete') === get(status, 'total')
  }

  /**
   * Unproject the analysis bounds into `Leaflet.LatLng` points to be used for a
   * rectangle. NB code was copied from another location that also incremented
   * `west` by 1. Possibly to ensure non-zero numbers.
   */
  _getAnalysisBounds() {
    const {north, west, width, height, zoom} = this.props.analysis
    const nw = lonlat.fromPixel({x: west + 1, y: north}, zoom)
    const se = lonlat.fromPixel({x: west + width + 1, y: north + height}, zoom)
    return [lonlat.toLeaflet(nw), lonlat.toLeaflet(se)]
  }

  _renderMap() {
    const p = this.props
    p.setMapChildren(() => (
      <>
        {!this._isComplete() && typeof window !== 'undefined' && (
          <Rectangle bounds={this._getAnalysisBounds()} weight={2} />
        )}

        <DotMap />
        <RegionalLayer />
        <AggregationArea />
      </>
    ))
  }

  render() {
    const p = this.props
    return (
      <>
        <ProfileRequestDisplay
          defaultExpanded
          {...p.analysis}
          {...p.analysis.request}
        />

        <Group justified>
          <Button onClick={this._renameAnalysis} size='sm' style='warning'>
            <Icon icon={faPencilAlt} />{' '}
            {message('analysis.renameRegionalAnalysis')}
          </Button>
          <Button onClick={p.deleteAnalysis} size='sm' style='danger'>
            <Icon icon={faTrash} /> {message('analysis.deleteRegionalAnalysis')}
          </Button>
        </Group>

        <br />

        {this._isComplete() ? (
          <>
            <label className='control-label'>
              {message('analysis.gisExport')}
            </label>
            <Button
              block
              onClick={this._downloadProjectGIS}
              size='sm'
              style='info'
            >
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
}
