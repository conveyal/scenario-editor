import {useRouter} from 'next/router'
import {useCallback} from 'react'
import {useDispatch} from 'react-redux'

import P from './components/p'
import FullSpinner from './components/full-spinner'
import usePromise from './hooks/use-promise'

// On statically generated pages the router.query is not immediately available. Next.js
// is working on a legitimate flag to replace this in the future.
const routerQueryIsReady = (router) =>
  Object.keys(router.query).length !== 0 || !router.pathname.includes('[')

const ShowError = (p) => (
  <div className='block'>
    <P>{String(p.error)}</P>
  </div>
)

export default function withInitialFetch(PageComponent, initialFetch) {
  return function InitialFetch(p) {
    const router = useRouter()
    const dispatch = useDispatch()

    // Page components are always passed a query object
    const {query} = router
    const queryIsReady = routerQueryIsReady(router)
    const getInitialFetch = useCallback(
      () =>
        queryIsReady ? initialFetch(dispatch, query) : Promise.resolve(null),
      [dispatch, query, queryIsReady]
    )
    const [loading, error, results] = usePromise(getInitialFetch)

    if (error) return <ShowError error={error} />
    if (loading) return <FullSpinner />
    if (results) return <PageComponent query={query} {...p} {...results} />

    return null
  }
}
