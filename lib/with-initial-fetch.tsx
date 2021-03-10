import dynamic from 'next/dynamic'
import {useRouter} from 'next/router'
import {FunctionComponent, useCallback} from 'react'
import {useDispatch} from 'react-redux'

import FullSpinner from 'lib/components/full-spinner'
import usePromise from 'lib/hooks/use-promise'

const ErrorAlert = dynamic(
  () => import('lib/components/connection-error-alert')
)

interface LayoutComponent extends FunctionComponent {
  Layout?: FunctionComponent<any>
}

type InitialFetchFn = (dispatch, query) => Promise<any>

// On statically generated pages the router.query is not immediately available. Next.js
// is working on a legitimate flag to replace this in the future.
const routerQueryIsReady = (router) =>
  Object.keys(router.query).length !== 0 || !router.pathname.includes('[')

export default function withInitialFetch(
  PageComponent,
  initialFetch: InitialFetchFn
): LayoutComponent {
  return function InitialFetch(p: any) {
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

    if (error) return <ErrorAlert>{error}</ErrorAlert>
    if (loading) return <FullSpinner />
    if (results) return <PageComponent query={query} {...p} {...results} />
  }
}
