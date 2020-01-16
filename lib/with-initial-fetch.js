import React from 'react'
import {useStore} from 'react-redux'

import InnerDock from './components/inner-dock'
import P from './components/p'
import Spinner from './components/spinner'
import usePromise from './hooks/use-promise'
import getInitialAuth from './get-initial-auth'

const spinnerStyle = {
  color: '#2389c9',
  fontSize: '36px',
  marginTop: '82px',
  textAlign: 'center',
  top: '50%',
  position: 'relative'
}

export default function withInitialFetch(Component, initialFetch, opts = {}) {
  const isServer = typeof window === 'undefined'

  function ClientFetch(p) {
    const store = useStore()
    const {query, __clientFetch} = p
    const getInitialFetch = React.useCallback(
      () => (__clientFetch ? initialFetch(store, query) : Promise.resolve({})),
      [store, query, __clientFetch]
    )
    const [loading, error, results] = usePromise(getInitialFetch)

    // Short circuit when loaded from server
    if (!__clientFetch) return <Component {...p} />

    return loading ? (
      <InnerDock className='block'>
        <div style={spinnerStyle}>
          <Spinner />
        </div>
      </InnerDock>
    ) : error ? (
      <div className='block'>
        <P>{String(error)}</P>
      </div>
    ) : (
      <Component {...p} {...results} />
    )
  }

  ClientFetch.getInitialProps = ctx =>
    getInitialAuth(ctx).then(({user}) =>
      isServer && !opts.clientOnly
        ? initialFetch(ctx.store, ctx.query).then(results => ({
            ...results,
            user
          }))
        : {__clientFetch: true, user}
    )

  return ClientFetch
}
