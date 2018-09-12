// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'

import {DEFAULT_BOUNDS} from '../constants/region'

import {Application, Dock, Title} from './base'
import {Button} from './buttons'
import {Text, File} from './input'
import EditBounds from './map/edit-bounds'
import LabelLayer from './map/label-layer'

const cardinalDirections = ['North', 'South', 'East', 'West']

function parseLon (val) {
  const lon = parseFloat(val)
  if (isNaN(lon) || lon < -180 || lon > 180) {
    throw new Error('Invalid longtitude.')
  }
  return lon
}

function parseLat (val) {
  const lat = parseFloat(val)
  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Invalid latitude.')
  }
  return lat
}

type Props = {
  create: ({customOpenStreetMapData: ?Object, region: any}) => void
}

export default class CreateRegion extends Component<Props> {
  state = {
    customOpenStreetMapData: undefined,
    error: undefined,
    uploading: false,
    region: {
      bounds: DEFAULT_BOUNDS,
      description: ''
    }
  }

  onChangeDescription = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.onChange({description: e.target.value})
  onChangeName = (e: SyntheticInputEvent<HTMLInputElement>) =>
    this.onChange({name: e.target.value})

  onChange = (updatedFields: {[any]: any}) => {
    // set it locally so that state is shared with bounds editor
    this.setState({region: {...this.state.region, ...updatedFields}})
  }

  _changeCustomOsm = (e: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({customOpenStreetMapData: e.target.files[0]})
  }

  _create = () => {
    // Create/save will redirect to the region status page
    this.setState({uploading: true})
    this.props.create(this.state)
  }

  _setBoundsFor = memoize((direction: string) => (e: SyntheticInputEvent<HTMLInputElement>) => {
    const {bounds} = this.state.region
    let value = e.target.value
    try {
      value = direction === 'north' || direction === 'south'
        ? parseLat(value)
        : parseLon(value)
    } catch (e) {
      this.setState({
        error: e.message
      })
    }

    this.onChange({bounds: {
      ...bounds,
      [direction]: value
    }})
  })

  _readyToCreate () {
    const {bounds, name} = this.state.region
    const {customOpenStreetMapData} = this.state
    try {
      parseLat(bounds.north)
      parseLat(bounds.south)
      parseLon(bounds.east)
      parseLon(bounds.west)
      return customOpenStreetMapData && name && name.length > 0
    } catch (e) {
      return false
    }
  }

  _map = () =>
    <g>
      <LabelLayer />
      <EditBounds
        bounds={this.state.region.bounds}
        save={bounds => this.onChange({bounds})}
      />
    </g>

  render () {
    const {region, uploading} = this.state
    const readyToCreate = this._readyToCreate()
    return (
      <Application map={this._map}>
        <Title><Icon type='map-o' /> {message('region.createAction')}</Title>
        <Dock>
          <Text
            label={message('region.name') + '*'}
            name={message('region.name')}
            onChange={this.onChangeName}
            value={region.name}
          />
          <Text
            label={message('region.description')}
            name={message('region.description')}
            onChange={this.onChangeDescription}
            value={region.description}
          />
          <h5>{message('region.osmBounds')}</h5>
          {cardinalDirections.map(direction => (
            <Text
              key={`bound-${direction}`}
              label={`${direction} bound`}
              name={`${direction} bound`}
              onChange={this._setBoundsFor(direction.toLowerCase())}
              value={region.bounds[direction.toLowerCase()]}
            />
          ))}

          osmconvert crop command
          <div className='alert alert-info all-copy'>
            {'osmconvert [file].pbf -b="' +
            region.bounds['west'] + ', ' +
            region.bounds['south'] + ', ' +
            region.bounds['east'] + ', ' +
            region.bounds['north'] +
            '"--complete-ways -o=[file]-cropped.pbf'}
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
            <Icon type='check' /> {message('region.createAction')}
          </Button>
        </Dock>
      </Application>
    )
  }
}
