// @flow
import React from 'react'

export default class InnerDock extends React.PureComponent<Props, State> {
  _el: HTMLElement
  state: {
    height?: number
  }

  componentDidMount () {
    window.addEventListener('resize', this._setHeight)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this._setHeight)
  }

  _ref = (el: HTMLElement) => {
    this._el = el
    this._setHeight()
  }

  _setHeight = () => {
    if (this._el) {
      this.setState({
        height: window.innerHeight - this._el.offsetTop
      })
    }
  }

  render () {
    return <div
      className={`InnerDock ${this.props.className || ''}`}
      ref={this._ref}
      style={this.state}
    >{this.props.children}</div>
  }
}
