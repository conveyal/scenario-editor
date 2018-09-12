// @flow
import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {PureComponent} from 'react'

import {Button, Group as ButtonGroup} from '../buttons'
import {Group} from '../input'
import messages from '../../utils/messages'

type Props = {
  disabled: boolean,
  egressModes: string,
  update: ({egressModes: string}) => void
}

const WALK = 'WALK'
const BICYCLE = 'BICYCLE'

/** Select modes of travel */
export default class EgressModeSelector extends PureComponent<Props> {
  _selectEgressMode = memoize(newMode => () => {
    this.props.update({
      egressModes: newMode
    })
  })

  render () {
    const {disabled, egressModes} = this.props

    return (
      <Group label='Egress Modes'>
        <br />
        <ButtonGroup disabled={disabled}>
          <Button
            active={egressModes === WALK}
            onClick={this._selectEgressMode(WALK)}
            title={messages.analysis.modes.walk}
          >
            <Icon type='male' />
          </Button>
          <Button
            active={egressModes === BICYCLE}
            disabled
            onClick={this._selectEgressMode(BICYCLE)}
            title={`CURRENTLY DISABLED: ${messages.analysis.modes.bicycle}`}
          >
            <Icon type='bicycle' />
          </Button>
        </ButtonGroup>
      </Group>
    )
  }
}
