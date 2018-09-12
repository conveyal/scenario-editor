// @flow
import React, {Children, Component} from 'react'

export default class Tip extends Component<Props, State> {
  el: HTMLElement
  props: {
    children?: Children,
    className?: string,
    tip: string
  }

  state = {
    hovering: false,
    location: 'bottom',
    position: {
      top: 20,
      left: 40
    }
  }

  _mouseOver = () => this.setState({hovering: true})
  _mouseOut = () => this.setState({hovering: false})

  _setOuterEl = (el: HTMLElement) => {
    this.el = el
  }

  _setPosition = (tooltipEl: HTMLElement) => {
    if (!tooltipEl || !this.el) return

    const height = tooltipEl.clientHeight
    const width = tooltipEl.clientWidth
    const rect = this.el.getBoundingClientRect()
    const position = {}
    let {location} = this.state

    if (rect.left < width / 2) { // left side of the screen
      position.top = Math.max((this.el.offsetHeight - (location !== 'right' ? height - 10 : height)) / 2, 0)
      position.left = this.el.offsetWidth
      location = 'right'
    } else if (rect.top > window.innerHeight / 2) { // bottom half of the screen
      position.top = -height // height of the arrow
      position.left = -this.el.offsetWidth / 2
      location = 'top'
    } else { // default to bottom of the element
      position.top = height // height of the arrow
      position.left = -((width - this.el.offsetWidth) / 2)
    }

    this.setState({
      location,
      position
    })
  }

  render () {
    const {className = '', children, tip} = this.props
    const {hovering, location, position} = this.state
    return (
      <span
        className={`Tip ${className}`}
        onBlur={this._mouseOut}
        onFocus={this._mouseOver}
        onMouseOut={this._mouseOut}
        onMouseOver={this._mouseOver}
        ref={this._setOuterEl}>
        {children}
        {hovering &&
          <span
            className={`tooltip ${location}`}
            ref={this._setPosition}
            style={position}
          >
            <span className='tooltip-arrow' />
            <span className='tooltip-inner'>{tip}</span>
          </span>}
      </span>
    )
  }
}
