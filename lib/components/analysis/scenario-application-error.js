/** Display a scenario application error to the user */

import React, { PropTypes } from 'react'
import DeepEqualComponent from '../deep-equal'
import Collapsible from '../collapsible'
import {sprintf} from 'sprintf-js'
import messages from '../../utils/messages'

export default class ScenarioApplicationError extends DeepEqualComponent {
  static propTypes = {
    error: PropTypes.shape({
      messages: PropTypes.arrayOf(PropTypes.string).isRequired,
      modificationId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    }).isRequired
  }

  render () {
    const { error } = this.props

    // TODO we want the title in the collapsible but should this component really return a collapsible?
    return <Collapsible title={error.title}>
      {/* TODO when modificationId is an actual ID, link to the offending modification */}
      <i>{sprintf(messages.analysis.errorsInModification, error.modificationId)}</i>
      <ul>
        {error.messages.map((msg, idx) => <li key={`message-${idx}`}>{msg}</li>)}
      </ul>
    </Collapsible>
  }
}
