/** Select routes without selecting patterns */

import React, {Component, PropTypes} from 'react'
import Select from 'react-select'

import {Group as FormGroup} from '../input'

export default class SelectFeedAndRoutes extends Component {
  static propTypes = {
    feeds: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    selectedFeed: PropTypes.object,
    selectedRouteId: PropTypes.string
  }

  _selectFeed = (feed) => {
    this.props.onChange({feed: feed && feed.value, routes: null})
  }

  _selectRoute = (route) => {
    this.props.onChange({feed: this.props.selectedFeed.id, routes: !route || route.value === '' ? null : [route.value]})
  }

  render () {
    const {feeds, selectedFeed} = this.props
    const value = selectedFeed ? selectedFeed.id : undefined
    return (
      <div>
        <FormGroup>
          <Select
            clearable={false}
            name='Feed'
            onChange={this._selectFeed}
            options={feeds.map((f) => { return { value: f.id, label: f.id } })}
            placeholder='Select feed'
            value={value}
            />
        </FormGroup>

        {selectedFeed && this._renderSelectRoutes()}
      </div>
    )
  }

  _renderSelectRoutes () {
    const {selectedFeed, selectedRouteId} = this.props

    return (
      <FormGroup>
        <Select
          clearable={false}
          name='Route'
          onChange={this._selectRoute}
          options={selectedFeed.routes.map((r) => { return { value: r.route_id, label: r.label } })}
          placeholder='Select route'
          value={selectedRouteId}
          />
      </FormGroup>
    )
  }
}
