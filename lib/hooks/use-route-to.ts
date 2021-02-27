import Router from 'next/router'
import {useCallback} from 'react'

import {PageKey} from 'lib/constants'

import useLink from './use-link'

import {pageToHref} from '../router'

/**
 * Create an `onClick` function for navigation.
 */
export default function useRouteTo(
  key: PageKey,
  props: Record<string, string> = {}
) {
  const link = useLink(key, props)

  const onClick = useCallback(
    (newProps?: any) => {
      if (newProps && !newProps.nativeEvent) {
        Router.push(pageToHref(key, {...props, ...newProps}))
      } else {
        Router.push(link)
      }
    },
    [link, props, key]
  )

  return onClick
}
