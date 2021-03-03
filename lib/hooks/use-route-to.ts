import {dequal} from 'dequal/lite'
import Router from 'next/router'
import {useCallback, useEffect, useState} from 'react'

import {routeTo} from '../router'

export default function useRouteTo(to: string, props: any = {}) {
  const [result, setResult] = useState(() => routeTo(to, props))

  useEffect(() => {
    const newRouteTo = routeTo(to, props)
    if (!dequal(newRouteTo, result)) {
      setResult(newRouteTo)

      // Prefetch in production
      Router.prefetch(newRouteTo.href, newRouteTo.as)
    }
  }, [props, result, setResult, to])

  const onClick = useCallback(
    (newProps?: any) => {
      if (newProps && !newProps.nativeEvent) {
        const newRoute = routeTo(to, newProps)
        Router.push(
          {pathname: newRoute.href, query: newRoute.query},
          newRoute.as
        )
      } else {
        Router.push({pathname: result.href, query: result.query}, result.as)
      }
    },
    [result, to]
  )

  return onClick
}
