/** Import a shapefile. This more or less does what geom2gtfs used to. */

// use the reflow functionality in transit editor layer
import React, {PropTypes} from 'react'
import shp from 'shpjs'
import distance from '@turf/distance'
import {lineString, point} from '@turf/helpers'
import uuid from 'uuid'
import dbg from 'debug'

import {Button} from './buttons'
import DeepEqual from './deep-equal'
import {File, Number as InputNumber, Select, Checkbox} from './input'
import {Body, Heading, Panel} from './panel'
import messages from '../utils/messages'

const debug = dbg('scenario-editor:import-shapefile')

export default class ImportShapefile extends DeepEqual {
  static propTypes = {
    close: PropTypes.func.isRequired,
    setModification: PropTypes.func.isRequired,
    variants: PropTypes.array.isRequired,
    scenarioId: PropTypes.string.isRequired
  }

  state = {
    shapefile: null,
    stopSpacingMeters: 400, // meters
    bidirectional: true,
    autoCreateStops: true
  }

  shapefileRead = (e) => {
    debug(`read ${e.target.result.byteLength} bytes`)
    const shapefile = shp.parseZip(e.target.result)
    const properties = []

    for (const key in shapefile.features[0].properties) {
      if (shapefile.features[0].properties.hasOwnProperty(key)) properties.push(key)
    }

    this.setState(Object.assign({}, this.state, { shapefile, properties, nameProp: properties[0], freqProp: properties[0], speedProp: properties[0], error: undefined }))
  }

  changeStopSpacingMeters = (e) => {
    debug(e.target.value)
    this.setState(Object.assign({}, this.state, { stopSpacingMeters: Number(e.target.value) }))
  }

  selectShapefile = (e) => {
    // read the shapefile
    const reader = new window.FileReader()
    reader.onloadend = this.shapefileRead
    reader.readAsArrayBuffer(e.target.files[0])
  }

  changeNameProp = (e) => {
    this.setState(Object.assign({}, this.state, { nameProp: e.target.value }))
  }

  changeFreqProp = (e) => {
    this.setState(Object.assign({}, this.state, { freqProp: e.target.value }))
  }

  changeSpeedProp = (e) => {
    this.setState(Object.assign({}, this.state, { speedProp: e.target.value }))
  }

  changeBidirectional = (e) => {
    this.setState(Object.assign({}, this.state, { bidirectional: e.target.checked }))
  }

  changeAutoCreateStops = (e) => {
    this.setState(Object.assign({}, this.state, { autoCreateStops: e.target.checked }))
  }

  /** create and save modifications for each line */
  create = () => {
    let mods
    debug('test')
    try {
      mods = this.state.shapefile.features.map((feat) => {
        const segments = []

        // we make each segment in the input geometry a segment in the output.
        // otherwise adding a stop in the middle would replace all of the surrounding geometry.
        let { coordinates, type } = feat.geometry

        if (type === 'MultiLineString') {
          // flatten the coordinates
          const flat = []

          for (let i = 0; i < coordinates.length; i++) {
            if (i > 0) {
              // make sure they line up at the ends
              if (distance(point(coordinates[i - 1].slice(-1)[0]), point(coordinates[i][0]), 'kilometers') > 0.05) {
                this.setState(Object.assign({}, this.state, { error: messages.shapefile.invalidMultiLineString }))
                throw new Error('Invalid feature')
              }

              coordinates[i].forEach(c => flat.push(c))
            }
          }

          coordinates = flat
        } else if (type !== 'LineString') {
          this.setState(Object.assign({}, this.state, { error: messages.shapefile.invalidShapefileType }))
          throw new Error('Invalid type')
        }

        for (let i = 1; i < coordinates.length; i++) {
          segments.push({
            geometry: lineString([coordinates[i - 1], coordinates[i]]).geometry,
            spacing: this.state.autoCreateStops ? this.state.stopSpacingMeters : 0,
            stopAtStart: false,
            stopAtEnd: false,
            fromStopId: null,
            toStopId: null
          })
        }

        if (segments.length > 0) {
          segments[0].stopAtStart = true
          segments[segments.length - 1].stopAtEnd = true
        }

        const mod = {
          id: uuid.v4(),
          scenario: this.props.scenarioId,
          name: feat.properties[this.state.nameProp],
          segments,
          bidirectional: this.state.bidirectional,
          type: 'add-trip-pattern',
          showOnMap: false,
          expanded: false,
          variants: this.props.variants.map((v) => true),
          timetables: [{
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
            segmentSpeeds: segments.map(s => feat.properties[this.state.speedProp]),
            headwaySecs: feat.properties[this.state.freqProp] * 60,
            dwellTime: 0,
            startTime: 5 * 3600,
            endTime: 22 * 3600
          }]
        }

        return mod
      })
    } catch (e) {
      debug(e)
      return
    }

    mods.forEach((m) => this.props.setModification(m))
    this.props.close()
  }

  render () {
    return (
      <Panel>
        <Heading>Import Shapefile</Heading>
        <Body>
          <File
            label='Select Shapefile (zipped):'
            onChange={this.selectShapefile}
            />

          {this.renderError()}
          {this.renderShapefile()}

          <Button
            block
            disabled={!this.state.shapefile}
            onClick={this.create}
            style='success'
            >Import
          </Button>
          <Button
            block
            onClick={this.props.close}
            style='danger'
            >Cancel
          </Button>
        </Body>
      </Panel>
    )
  }

  renderError () {
    if (this.state.error) {
      return <div className='alert alert-danger'>{this.state.error}</div>
    }
  }

  renderShapefile () {
    if (this.state.shapefile) {
      return (
        <div>
          <Select
            label='Name property'
            onChange={this.changeNameProp}
            value={this.state.nameProp}
            >
            {this.state.properties.map((p) => <option key={`name-property-${p}`} value={p}>{p}</option>)}
          </Select>

          <Select
            label='Frequency property'
            onChange={this.changeFreqProp}
            value={this.state.freqProp}
            >
            {this.state.properties.map((p) => <option key={`frequency-property-${p}`} value={p}>{p}</option>)}
          </Select>

          <Select
            label='Speed property'
            onChange={this.changeSpeedProp}
            value={this.state.speedProp}
            >
            {this.state.properties.map((p) => <option key={`speed-property-${p}`} value={p}>{p}</option>)}
          </Select>

          <div className='checkbox'>
            <label htmlFor='Bidirectional'>
              <input type='checkbox' checked={this.state.bidirectional} onChange={this.changeBidirectional} /> Bidirectional
            </label>
          </div>

          <Checkbox
            label={messages.transitEditor.autoCreateStops}
            name='autoCreateStops'
            checked={this.state.autoCreateStops}
            onChange={this.changeAutoCreateStops}
            />

          {this.state.autoCreateStops &&
            <InputNumber
              label='Stop spacing (meters)'
              onChange={this.changeStopSpacingMeters}
              value={this.state.stopSpacingMeters}
              />
          }
        </div>
      )
    }
  }
}
