import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import dynamic from 'next/dynamic'
import {useRouter} from 'next/router'
import {useEffect} from 'react'
import {Provider, useDispatch, useSelector} from 'react-redux'

import {clearError, setQueryString} from './actions'
import getOrInitializeStore from './store'

const ErrorModal = dynamic(() => import('lib/components/error-modal'), {
  ssr: false
})

function getMessageFromError(e) {
  let message = ''
  if (e.message) message += e.message
  else if (e.status) message += e.status + ' '
  else if (e.statusText) message += e.statusText + ' '

  // Body text may be parsed
  if (
    e.value &&
    !(e.headers && e.headers.get('Content-Type').indexOf('text/html') > -1)
  )
    message += '\n' + get(e, 'value.message', e.value)
  return message
}

const selectError = fpGet('network.error')

function ReduxErrorModal() {
  const dispatch = useDispatch()
  const networkError = useSelector(selectError)

  if (!networkError) return null
  const error = new Error(getMessageFromError(networkError))
  error.stack = networkError.stackTrace ?? networkError.stack
  return (
    <ErrorModal
      error={error}
      resetErrorBoundary={() => dispatch(clearError())}
    />
  )
}

export default function withRedux(PageComponent) {
  return function ReduxedPage(p) {
    const router = useRouter()
    const store = getOrInitializeStore()

    // This does not watch for changes. Page components are passed the current query. It merely puts it in the store
    const {query} = router
    useEffect(() => {
      store.dispatch(setQueryString(query))
    }, [store, query])

    return (
      <Provider store={store}>
        <ReduxErrorModal />
        <PageComponent query={query} {...p} />
      </Provider>
    )
  }
}
