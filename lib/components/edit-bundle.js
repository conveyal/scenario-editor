// @flow
import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'
import Select from 'react-select'
import message from '@conveyal/woonerf/message'

import type {Bundle, ReactSelectResult} from '../types'

import {Button} from './buttons'
import {Group, Text} from './input'

type Props = {
  bundle?: Bundle,
  bundles: Bundle[],
  deleteBundle: () => void,

  goToCreateBundle: () => void,
  goToEditBundle: (_id: string) => void,
  isLoaded: boolean,
  saveBundle: (bundle: Bundle) => void
}

const labelBundles = (bundles: Bundle[]) => {
  return bundles.map(b => ({
    label: `${b.name}${b.status === 'DONE' ? '' : `: ${b.status}`}`,
    value: b._id
  }))
}

export default class EditBundle extends Component<Props> {
  state = {
    bundle: this.props.bundle,
    labeledBundles: labelBundles(this.props.bundles)
  }

  componentWillReceiveProps (nextProps: Props) {
    if (nextProps.bundle !== this.props.bundle) {
      this.setState({
        bundle: nextProps.bundle
      })
    }

    if (nextProps.bundles !== this.props.bundles) {
      this.setState({labeledBundles: labelBundles(nextProps.bundles)})
    }
  }

  _selectBundle = (result: ReactSelectResult) =>
    this.props.goToEditBundle(result.value)

  _submit = () => {
    if (this.state.bundle) {
      this.props.saveBundle(this.state.bundle)
    }
  }

  _deleteBundle = () =>
    window.confirm(message('bundle.deleteConfirmation')) &&
    this.props.deleteBundle()

  _setName = (e: SyntheticInputEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.value.length > 0) {
      this.setState({
        bundle: {
          ...this.state.bundle,
          name: `${e.target.value}`
        }
      })
    }
  }

  _setFeedName = memoize(feedId => (e: SyntheticInputEvent<HTMLInputElement>) => {
    const {bundle} = this.state
    if (bundle && e.target.value && e.target.value.length > 0) {
      this.setState({
        bundle: {
          ...bundle,
          feeds: bundle.feeds.map((f) => {
            if (f.feedId === feedId) {
              return {
                ...f,
                name: e.target.value
              }
            }
            return f
          })
        }
      })
    }
  })

  render () {
    const {bundle, goToCreateBundle} = this.props
    return (
      <div>
        <p>Bundles are a collection of one or more GTFS feeds.</p>

        <Group>
          <Button
            block
            onClick={goToCreateBundle}
            style='success'
          >
            <Icon type='plus' /> Create a bundle
          </Button>
        </Group>

        <p className='center'>or select an existing one</p>

        <Group>
          <Select
            clearable={false}
            options={this.state.labeledBundles}
            onChange={this._selectBundle}
            value={bundle && bundle._id}
          />
        </Group>

        {bundle &&
          <div>
            <h5>Edit Bundle</h5>

            {bundle.status === 'PROCESSING_GTFS' &&
              <div className='alert alert-warning'>
                {message('bundle.processing')}
              </div>}

            {bundle.status === 'ERROR' &&
              <div className='alert alert-danger'>
                {message('bundle.failure')}<br />{bundle.errorCode}
              </div>}

            <Text
              label={message('bundle.name')}
              name='Name'
              onChange={this._setName}
              placeholder='Bundle name'
              value={bundle.name}
            />

            {bundle.feeds && bundle.feeds.map((feed, index) => (
              <Text
                key={feed.feedId}
                label={`${message('bundle.feed')} #${index + 1}`}
                onChange={this._setFeedName(feed.feedId)}
                placeholder='Feed name'
                value={feed.name}
              />
            ))}

            <Button block onClick={this._submit} title={message('bundle.save')} style='success'>
              <Icon type='save' /> {message('bundle.save')}
            </Button>

            <Button block style='danger' onClick={this._deleteBundle}>
              <Icon type='trash' /> {message('bundle.delete')}
            </Button>
          </div>}
      </div>
    )
  }
}
