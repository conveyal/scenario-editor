import React from 'react'
import {Provider, useDispatch, useSelector} from 'react-redux'
import {useRouter} from 'next/router'

import {clearError, setQueryString} from './actions'
import ErrorModal from './components/error-modal'
import getOrInitializeStore from './store'

function getMessageFromError(e) {
  let message = `${e.status} ${e.statusText}`
  // Body text may be parsed
  if (e.value && !(e.headers.get('Content-Type').indexOf('text/html') > -1))
    message += `\n${e.value}`
  return message
}

function ReduxErrorModal() {
  const dispatch = useDispatch()
  const networkError = useSelector((s) => s.network.error)

  if (!networkError) return null

  return (
    <ErrorModal
      clear={() => dispatch(clearError())}
      error={{
        message: getMessageFromError(networkError),
        url: networkError.url
      }}
      title='Error while communicating with the server'
    />
  )
}

export default function withRedux(PageComponent) {
  return function ReduxedPage(p) {
    const router = useRouter()
    const store = getOrInitializeStore()

    // This does not watch for changes. Page components are passed the current query. It merely puts it in the store
    const {query} = router
    React.useEffect(() => {
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
