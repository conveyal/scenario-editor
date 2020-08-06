import isEqual from 'lodash/isEqual'
import Router from 'next/router'
import {useCallback, useEffect, useState} from 'react'

import {routeTo} from '../router'

export default function useRouteTo(to: string, props: any = {}) {
  const [result, setResult] = useState(() => routeTo(to, props))

  useEffect(() => {
    const newRouteTo = routeTo(to, props)
    if (!isEqual(newRouteTo, result)) {
      setResult(newRouteTo)

      // Prefetch in production
      Router.prefetch(newRouteTo.href, newRouteTo.as)
    }
  }, [props, result, setResult, to])

  const onClick = useCallback(() => {
    Router.push({pathname: result.href, query: result.query}, result.as)
  }, [result])

  return onClick
}
