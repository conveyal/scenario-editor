import Router from 'next/router'
import {useEffect, useState} from 'react'

import {PageKey} from 'lib/constants'

import {pageToHref} from '../router'

/**
 * Create a string `href` for navigation.
 */
export default function useLink(
  key: PageKey,
  query: Record<string, string> = {}
): string {
  const [link, setLink] = useState<string>(() => pageToHref(key, query))

  useEffect(() => {
    const newHref = pageToHref(key, query)
    if (newHref !== link) {
      setLink(newHref)

      // Prefetch in production
      Router.prefetch(newHref)
    }
  }, [query, key, link, setLink])

  return link
}
