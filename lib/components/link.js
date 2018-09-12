// @flow
import Icon from '@conveyal/woonerf/components/icon'
import React, {Children, Component} from 'react'
import {Link as RouterLink} from 'react-router'

import Tip from './tip'

export default class Link extends Component<Props, State> {
  props: {
    children?: Children,
    className?: string,
    tip?: string,
    title?: string,
    to?: string
  }

  render () {
    const {children, className, tip, title, to, ...props} = this.props
    return (
      <Tip className={className} tip={tip || title}>
        {to
          ? <RouterLink name={title} to={to} {...props}>{children}</RouterLink>
          : <a name={title} tabIndex={0} type='button' {...props}>{children}</a>}
      </Tip>
    )
  }
}

export const IconLink = ({type, ...props}: {props?: any, type: string}) =>
  <Link {...props} type='button'><Icon type={type} /></Link>
