// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'
import type {Children} from 'react'

import {Application, Dock, Title} from '../../../components/base'

import Dotmap from './dotmap'

export default class Heading extends PureComponent<Props, State> {
  props: {
    children?: Children
  }

  _map () { return <Dotmap /> }

  render () {
    return (
      <Application map={this._map}>
        <Title><Icon type='th' /> Opportunity Datasets</Title>
        <Dock>{this.props.children}</Dock>
      </Application>
    )
  }
}
