import React, {PropTypes} from 'react'

import DeepEqualComponent, {pure} from './deep-equal'
import Icon from './icon'

export const Group = pure(function ButtonGroup ({children, justified, vertical, radio}) {
  const classNames = ['btn-group']
  if (justified) classNames.push('btn-group-justified')
  if (vertical) classNames.push('btn-group-vertical')

  const opts = {}
  if (radio) opts['data-toggle'] = 'radio'

  return (
    <div className={classNames.join(' ')} {...opts}>{children}</div>
  )
})

export const Button = pure(function Button ({block, children, className, onClick, size, style, href = '#', target, checked, radio, ...props}) {
  const classNames = ['btn']
  if (style) classNames.push(`btn-${style}`)
  else classNames.push('btn-default')
  if (block) classNames.push('btn-block')
  if (size) classNames.push(`btn-${size}`)
  if (className) classNames.push(className)
  let wrappedOnClick = (e) => {}
  if (onClick) {
    wrappedOnClick = (e) => {
      e.preventDefault()
      if (!props.disabled) {
        onClick(e)
      }
    }
  }

  if (radio && checked) classNames.push('active')

  if (radio) {
    return <label className={classNames.join(' ')}>
      <input
        type='radio'
        onClick={wrappedOnClick}
        checked={checked}
        className='sr-only'
        {...props}
        />
      {children}
    </label>
  }
  return <a
    className={classNames.join(' ')}
    href={href}
    target={target}
    onClick={wrappedOnClick}
    {...props}
    >{children}</a>
})

/** A toggle button that uses a shaded icon to indicate checkiness */
export class IconToggle extends DeepEqualComponent {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    checkedTooltip: PropTypes.string.isRequired, // The tooltip when the icon is checked
    icon: PropTypes.string.isRequired,
    uncheckedTooltip: PropTypes.string.isRequired,

    onChange: PropTypes.func.isRequired
  }

  toggle = (e) => {
    const {onChange, checked} = this.props
    // TODO maintain in state?
    onChange(!checked)
  }

  keypress = (e) => {
    if (e.charCode === 32) {
      // spacebar
      this.toggle()
    }
  }

  render () {
    const {icon, checked, checkedTooltip, uncheckedTooltip} = this.props
    return <Icon
      type={icon}
      style={{
        color: checked ? '#000' : '#aaa',
        cursor: 'pointer'
      }}
      title={checked ? checkedTooltip : uncheckedTooltip}
      aria-label={checked ? checkedTooltip : uncheckedTooltip}
      role='switch'
      aria-checked={checked}
      tabIndex={0} // reintroduce to tab flow
      onClick={this.toggle}
      onKeyPress={this.keypress}
      />
  }
}
