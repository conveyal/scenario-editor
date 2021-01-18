import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack
} from '@chakra-ui/core'
import {useRouter} from 'next/router'
import {FunctionComponent, useCallback} from 'react'
import {useDispatch} from 'react-redux'

import FullSpinner from './components/full-spinner'
import {ExternalLink} from './components/link'
import usePromise from './hooks/use-promise'
import message from './message'

interface LayoutComponent extends FunctionComponent {
  Layout?: FunctionComponent<any>
}

type InitialFetchFn = (dispatch, query) => Promise<any>

// On statically generated pages the router.query is not immediately available. Next.js
// is working on a legitimate flag to replace this in the future.
const routerQueryIsReady = (router) =>
  Object.keys(router.query).length !== 0 || !router.pathname.includes('[')

const ShowError = ({children}) => (
  <Alert status='error' m={4} width='320px'>
    <AlertIcon />
    <Stack>
      <AlertTitle>Error loading data</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
      <AlertDescription>
        <>{message('error.report')} </>
        <ExternalLink href='mailto:support@conveyal.com'>
          support@conveyal.com
        </ExternalLink>
      </AlertDescription>
    </Stack>
  </Alert>
)

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

    if (error) return <ShowError>{error}</ShowError>
    if (loading) return <FullSpinner />
    if (results) return <PageComponent query={query} {...p} {...results} />
  }
}
