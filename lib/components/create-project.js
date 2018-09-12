// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React from 'react'
import Select from 'react-select'

import type {Bundle} from '../types'

import {Application, Title, Dock} from './base'
import {Button} from './buttons'
import {Group as FormGroup, Text} from './input'

type Props = {
  bundles: Bundle[],
  create: (any) => void,

  goToCreateBundle: () => void,
  regionId: string
}

export default class CreateProject extends React.PureComponent<Props> {
  state = {
    bundleId: null,
    name: ''
  }

  _create = () => {
    const {create, regionId} = this.props
    const {bundleId, name} = this.state
    if (name && bundleId) {
      create({
        bundleId,
        name,
        regionId
      })
    }
  }

  _goToCreateBundle = () => this.props.goToCreateBundle(this.props.regionId)

  render () {
    const {bundles} = this.props
    const {bundleId, name} = this.state
    const readyToCreate =
      name && name.length > 0 && bundleId && bundleId.length > 0
    return (
      <Application>
        <Title>{message('project.createAction')}</Title>
        <Dock>
          <Text
            label={message('project.name')}
            name={message('common.name')}
            onChange={e => this.setState({name: e.target.value})}
            value={name}
          />
          {bundles.length > 0
            ? <FormGroup
              id='select-bundle'
              label={message('project.bundle')}>
              <Select
                clearable={false}
                id='select-bundle'
                options={bundles.map(bundle => ({
                  value: bundle._id, label: bundle.name
                }))}
                onChange={option =>
                  this.setState({bundleId: option.value})}
                placeholder={message('project.selectBundle')}
                value={bundleId}
              />
            </FormGroup>
            : <FormGroup>
              <p>{message('project.noBundles')}</p>
              <Button block onClick={this._goToCreateBundle} style='success'>
                <Icon type='plus' /> {message('bundle.create')}
              </Button>
            </FormGroup>}
          {!readyToCreate && <p className='alert alert-danger'>
            <Icon type='exclamation-circle' /> {message('project.createActionTooltip')}
          </p>}
          <Button
            block
            disabled={!readyToCreate}
            onClick={this._create}
            style='success'
          >
            <Icon type='check' /> {message('common.create')}
          </Button>
        </Dock>
      </Application>
    )
  }
}
