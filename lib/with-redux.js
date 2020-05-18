import React from 'react'
import {Provider} from 'react-redux'
import {useRouter} from 'next/router'

import {setQueryString} from './actions'
import ErrorModal from './components/error-modal'
import getOrInitializeStore from './store'

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
        <ErrorModal />
        <PageComponent query={query} {...p} />
      </Provider>
    )
  }
}
