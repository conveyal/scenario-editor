// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {PureComponent} from 'react'

import messages from '../../utils/messages'
import type {Modification} from '../../types'

import ModificationTitle from './title'

type Props = {
  goToEditModification: (_id: string) => void,
  modifications: Modification[],

  type: string,
  updateModification: (modification: Modification) => void
}

type State = {
  expanded: boolean
}

export default class ModificationGroup extends PureComponent<Props, State> {
  state = {
    expanded: true
  }

  _toggleExpand = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    const {
      goToEditModification,
      modifications,
      type,
      updateModification
    } = this.props
    const {expanded} = this.state
    const iconName = expanded ? 'caret-down' : 'caret-right'
    const showOrHide = expanded ? 'Hide' : 'Show'

    return (
      <div className='ModificationGroup'>
        <div className='ModificationGroupTitle'>
          <a
            onClick={this._toggleExpand}
            tabIndex={0}
            title={`${showOrHide} modification group`}
          >
            <Icon type={iconName} /> {messages.modificationType[type]}
          </a>
        </div>
        {expanded &&
          <div className='ModificationTitles'>
            {modifications.map(modification => (
              <ModificationTitle
                goToEditModification={goToEditModification}
                key={`modification-${modification._id}`}
                modification={modification}
                name={modification.name}
                showOnMap={modification.showOnMap}
                updateModification={updateModification}
              />
            ))}
          </div>}
      </div>
    )
  }
}
