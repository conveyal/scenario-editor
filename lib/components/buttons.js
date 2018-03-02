// @flow
import * as React from 'react'
import {Link} from 'react-router'

export class Group extends React.PureComponent {
  props: {
    children?: React.Children,
    justified?: boolean,
    vertical?: boolean
  }

  render () {
    const {children, justified, vertical, ...props} = this.props
    const classNames = ['btn-group']
    if (justified) classNames.push('btn-group-justified')
    if (vertical) classNames.push('btn-group-vertical')

    return (
      <div className={classNames.join(' ')} {...props}>
        {children}
      </div>
    )
  }
}

export class Button extends React.PureComponent {
  props: {
    active?: boolean,
    block?: boolean,
    children?: React.Children,
    className?: string,
    disabled?: boolean,
    href?: string,
    onClick?: (any) => void
  }

  _onClick = (e: Event) => {
    const {disabled, onClick} = this.props
    if (onClick) {
      e.preventDefault()
      if (!disabled) {
        onClick(e)
      }
    }
  }

  render () {
    const {children, href = '#', ...props} = this.props
    const {classNames, restProps} = getClassNamesFromProps(props)
    return (
      <a
        {...restProps}
        className={classNames}
        href={href}
        tabIndex={0}
        onClick={this._onClick}
      >
        {children}
      </a>
    )
  }
}

export class ButtonLink extends React.PureComponent {
  props: {
    active?: boolean,
    block?: boolean,
    children?: React.Children,
    className?: string,
    disabled?: boolean,
    to: string
  }

  render () {
    const {children, ...props} = this.props
    const {classNames, restProps} = getClassNamesFromProps(props)
    return (
      <Link
        {...restProps}
        className={classNames}
      >
        {children}
      </Link>
    )
  }
}

function getClassNamesFromProps ({
  active,
  block,
  checked,
  className,
  size,
  style,
  ...restProps
}) {
  const classNames = ['btn']
  if (style) classNames.push(`btn-${style}`)
  else classNames.push('btn-default')
  if (block) classNames.push('btn-block')
  if (size) classNames.push(`btn-${size}`)
  if (className) classNames.push(className)
  if (active) classNames.push('active')
  return {
    classNames: classNames.join(' '),
    restProps
  }
}
