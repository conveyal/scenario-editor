import React from 'react'
import {useStore} from 'react-redux'

import P from './components/p'
import Spinner from './components/spinner'
import usePromise from './hooks/use-promise'
import useWindowSize from './hooks/use-window-size'
import getInitialAuth from './get-initial-auth'

const minHeight = '600px'
const minWidth = '320px'
const spinnerStyle = {
  color: '#2389c9',
  fontSize: '36px',
  marginTop: '-25px',
  width: '100%',
  textAlign: 'center',
  top: '50%',
  position: 'relative'
}

const ShowError = p => (
  <div className='block'>
    <P>{String(p.error)}</P>
  </div>
)
const ShowSpinner = () => (
  <div style={spinnerStyle}>
    <Spinner />
  </div>
)

export default function withInitialFetch(Component, initialFetch, opts = {}) {
  const serverRendered = typeof window === 'undefined'

  function ClientFetch(p) {
    const store = useStore()
    const {query, __clientFetch} = p
    const getInitialFetch = React.useCallback(
      () => (__clientFetch ? initialFetch(store, query) : Promise.resolve({})),
      [store, query, __clientFetch]
    )
    const [loading, error, results] = usePromise(getInitialFetch)
    const size = useWindowSize()

    // Short circuit when loaded from server
    if (!__clientFetch) return <Component {...p} />
    if (error) return <ShowError error={error} />
    if (results) return <Component {...p} {...results} />

    return (
      <div style={{height: size.height || minHeight, minWidth}}>
        {loading ? <ShowSpinner /> : <div ssr={`${serverRendered}`} />}
      </div>
    )
  }

  ClientFetch.getInitialProps = ctx =>
    getInitialAuth(ctx).then(({user}) =>
      serverRendered && !opts.clientOnly
        ? initialFetch(ctx.store, ctx.query).then(results => ({
            ...results,
            user
          }))
        : {__clientFetch: true, user}
    )

  return ClientFetch
}
