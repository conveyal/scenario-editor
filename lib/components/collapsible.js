// @flow
import Icon from '@conveyal/woonerf/components/icon'
import PropTypes from 'prop-types'
import React, {Component} from 'react'

/**
 * A simple collapsible element for hiding children
 */
export default class Collapsible extends Component<Props, State> {
  static propTypes = {
    title: PropTypes.string.isRequired,
    defaultExpanded: PropTypes.bool
  }

  static defaultProps = {
    defaultExpanded: false
  }

  state = {
    expanded: this.props.defaultExpanded
  }

  toggleExpanded = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    const {expanded} = this.state
    const {title, children} = this.props
    return (
      <div>
        <div role='heading' aria-level={3}>
          <a
            aria-expanded={expanded}
            className='CollapsibleButton'
            onClick={this.toggleExpanded}
            role='button'
            tabIndex={0}
          >
            <Icon type={expanded ? 'caret-down' : 'caret-right'} />
            <strong>
              {title}
            </strong>
          </a>
        </div>
        {expanded && children}
      </div>
    )
  }
}
