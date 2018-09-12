// @flow
import message from '@conveyal/woonerf/message'
import React, {PureComponent} from 'react'

import Collapsible from '../collapsible'

type Props = {
  error: {
    messages: string[],
    modificationId: string,
    title: string
  }
}

/** Display a scenario application error to the user */
export default class ScenarioApplicationError extends PureComponent<Props, State> {
  render () {
    const {error} = this.props

    // TODO we want the title in the collapsible but should this component really return a collapsible?
    return (
      <Collapsible title={error.title}>
        {/* TODO when modificationId is an actual ID, link to the offending modification */}
        <i>
          {message('analysis.errorsInModification', {
            id: error.modificationId
          })}
        </i>
        <ul>
          {error.messages.map((msg, idx) => (
            <li key={`message-${idx}`}>
              {msg}
            </li>
          ))}
        </ul>
      </Collapsible>
    )
  }
}
