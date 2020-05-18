import {Flex} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import React from 'react'
import {useDispatch} from 'react-redux'

import P from './components/p'
import Spinner from './components/spinner'
import usePromise from './hooks/use-promise'
import useWindowSize from './hooks/use-window-size'

// On statically generated pages the router.query is not immediately available. Next.js
// is working on a legitimate flag to replace this in the future.
const routerQueryIsReady = (router) =>
  Object.keys(router.query).length !== 0 || !router.pathname.includes('[')

const minHeight = '600px'
const minWidth = '320px'
const spinnerStyle = {
  color: '#2389c9',
  fontSize: '36px',
  marginTop: '-25px'
}

const ShowError = (p) => (
  <div className='block'>
    <P>{String(p.error)}</P>
  </div>
)
const ShowSpinner = () => (
  <span style={spinnerStyle}>
    <Spinner />
  </span>
)

export default function withInitialFetch(PageComponent, initialFetch) {
  return function InitialFetch(p) {
    const router = useRouter()
    const dispatch = useDispatch()
    const size = useWindowSize()

    // Page components are always passed a query object
    const {query} = router
    const queryIsReady = routerQueryIsReady(router)
    const getInitialFetch = React.useCallback(
      () =>
        queryIsReady ? initialFetch(dispatch, query) : Promise.resolve(null),
      [dispatch, query, queryIsReady]
    )
    const [loading, error, results] = usePromise(getInitialFetch)

    if (error) return <ShowError error={error} />
    if (loading)
      return (
        <Flex
          align='center'
          direction='column'
          height={size.height || minHeight}
          m='0 auto'
          justify='center'
          width={minWidth}
        >
          <ShowSpinner />
        </Flex>
      )
    if (results) return <PageComponent query={query} {...p} {...results} />

    return null
  }
}
