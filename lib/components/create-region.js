import {faCheck, faMap} from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
import {withRouter} from 'next/router'
import React from 'react'

import {DEFAULT_BOUNDS} from 'lib/constants/region'
import message from 'lib/message'
import reprojectCoordinates from 'lib/utils/reproject-coordinates'
import {routeTo} from 'lib/router'

import {Button} from './buttons'
import H5 from './h5'
import Icon from './icon'
import InnerDock from './inner-dock'
import {Text, File} from './input'
import P from './p'

const EditBounds = dynamic(() => import('./map/edit-bounds'), {ssr: false})

const cardinalDirections = ['North', 'South', 'East', 'West']

/**
 * Create a region.
 */
class CreateRegion extends React.PureComponent {
  state = {
    customOpenStreetMapData: undefined,
    error: undefined,
    uploading: false,
    bounds: DEFAULT_BOUNDS,
    description: '',
    name: ''
  }

  componentDidMount() {
    this._renderMap()
  }

  componentWillUnmount() {
    this.props.setMapChildren(<React.Fragment />)
  }

  componentDidUpdate() {
    this._renderMap()
  }

  onChangeDescription = e => this.setState({description: e.target.value})
  onChangeName = e => this.setState({name: e.target.value})

  _changeCustomOsm = e => {
    this.setState({customOpenStreetMapData: e.target.files[0]})
  }

  // Create/save will keep checking load status and redirect to the region page
  _create = () => {
    const p = this.props
    const s = this.state

    const b = s.bounds
    const nw = reprojectCoordinates({lat: b.north, lon: b.west})
    const se = reprojectCoordinates({lat: b.south, lon: b.east})
    const bounds = {north: nw.lat, west: nw.lon, south: se.lat, east: se.lon}

    // Validate the bounds
    const boundsIsNaN =
      isNaN(b.north) || isNaN(b.south) || isNaN(b.east) || isNaN(b.west)
    if (boundsIsNaN) {
      window.alert('Bounds must be valid coordinates.')
      return
    }

    if (bounds.north < bounds.south) {
      window.alert('North must be higher latitude than south.')
      return
    }

    if (bounds.east < bounds.west) {
      window.alert(
        'East must be a higher longitude than west. Bounds cannot cross the antimeridian'
      )
      return
    }

    this.setState({uploading: true})
    // Construct the form data object
    const formData = new window.FormData()
    formData.append(
      'region',
      JSON.stringify({
        name: s.name,
        description: s.description,
        bounds
      })
    )
    formData.append('customOpenStreetMapData', s.customOpenStreetMapData)
    p.create(formData).then(region => {
      const {as, href} = routeTo('projects', {regionId: region._id})
      p.router.push(href, as)
    })
  }

  _setBoundsFor = direction => e => {
    const {bounds} = this.state
    this.setState({
      bounds: {
        ...bounds,
        [direction]: e.target.value
      }
    })
  }

  _readyToCreate() {
    const {customOpenStreetMapData, name} = this.state
    return customOpenStreetMapData && name && name.length > 0
  }

  _renderMap() {
    this.props.setMapChildren(() => (
      <EditBounds
        bounds={this.state.bounds}
        save={bounds => this.setState({bounds})}
      />
    ))
  }

  render() {
    const {bounds, description, name, uploading} = this.state
    const readyToCreate = this._readyToCreate()
    return (
      <InnerDock className='block'>
        <legend>
          <Icon icon={faMap} /> <span> {message('region.createAction')}</span>
        </legend>
        <Text
          label={message('region.name') + '*'}
          name={message('region.name')}
          onChange={this.onChangeName}
          value={name}
        />
        <Text
          label={message('region.description')}
          name={message('region.description')}
          onChange={this.onChangeDescription}
          value={description}
        />
        <H5>{message('region.bounds')}</H5>
        <div className='alert alert-warning'>
          <P>{message('region.boundsNotice')}</P>
          <a
            href='http://docs.analysis.conveyal.com/en/latest/analysis/methodology.html#spatial-resolution'
            rel='noopener noreferrer'
            target='_blank'
          >
            Learn more about spatial resolution here.
          </a>
        </div>
        {cardinalDirections.map(direction => (
          <Text
            key={`bound-${direction}`}
            label={`${direction} bound`}
            name={`${direction} bound`}
            onChange={this._setBoundsFor(direction.toLowerCase())}
            value={bounds[direction.toLowerCase()]}
          />
        ))}
        osmconvert crop command
        <div className='alert alert-info all-copy'>
          {`osmconvert [file].pbf -b="${bounds.west}, ${bounds.south}, ${bounds.east}, ${bounds.north}" --complete-ways -o=[file]-cropped.pbf`}
        </div>
        <File
          label={message('region.customOpenStreetMapData')}
          name='customOpenStreetMapData'
          onChange={this._changeCustomOsm}
        />
        <Button
          block
          disabled={!readyToCreate || uploading}
          onClick={this._create}
          name={message('region.createAction')}
          style='success'
        >
          <Icon icon={faCheck} /> {message('region.createAction')}
        </Button>
      </InnerDock>
    )
  }
}

// Expsoe next/router to the component
export default withRouter(CreateRegion)
