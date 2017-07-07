import React from 'react'

import {pure} from './deep-equal'

export const Panel = pure(function Panel ({children, className, ...props}) {
  const extraClassName = className ? ` ${className}` : ''
  return <div className={`panel panel-default${extraClassName}`} {...props}>{children}</div>
})

export const Heading = pure(function Heading ({children, ...props}) {
  props.className = 'panel-heading clearfix' + ' ' + (props.className ? props.className : '')
  return <div {...props}>{children}</div>
})

export const Body = pure(function Body ({children, ...props}) {
  return <div className='panel-body' {...props}>{children}</div>
})
