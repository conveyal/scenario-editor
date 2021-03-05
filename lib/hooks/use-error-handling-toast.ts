import {IToast, useToast} from '@chakra-ui/react'
import {useEffect} from 'react'

import LogRocket from 'lib/logrocket'

const isServer = typeof window === 'undefined'
const fn = () => {}
const addListener = isServer ? fn : window.addEventListener
const removeListener = isServer ? fn : window.removeEventListener

const toastSettings: IToast = {
  duration: null,
  isClosable: true,
  position: 'top',
  status: 'error'
}

export default function useErrorHandlingToast() {
  const toast = useToast()
  // Handle error events
  useEffect(() => {
    // Don't show duplicate toasts of the same error.
    const toastTracker = new Set<string>() // title + description
    const showUniqueToast = (title: string, description: string) => {
      const slug = title + description
      if (!toastTracker.has(slug)) {
        toastTracker.add(slug)
        toast({
          ...toastSettings,
          description,
          title,
          // Remove toast type from tracker
          onCloseComplete: () => toastTracker.delete(slug)
        })
      }
    }

    const onError = (e: ErrorEvent) => {
      LogRocket.captureException(e.error)
      showUniqueToast('Application Error', e.message)
    }

    const onUnhandledRejection = (pre: PromiseRejectionEvent) => {
      const e: unknown = pre.reason
      let title = 'Application Error'
      let description = ''
      if (e instanceof Error) {
        LogRocket.captureException(e)
        description = e.message
        if (e.message === 'Failed to fetch') {
          title = 'Network Error'
          description =
            'Recent changes made may not have been saved. Please make sure you have an active internet connection and reload the page.'
        }
      }

      if (e instanceof Response) {
        title = 'Error while communicating with server'
        const value: unknown = (e as any).value
        if (typeof value === 'object') {
          description = value['message']
        } else if (typeof value === 'string') {
          description = value
        } else {
          description = e.statusText
        }
      }

      showUniqueToast(title, description)
    }

    addListener('error', onError)
    addListener('unhandledrejection', onUnhandledRejection)

    return () => {
      removeListener('error', onError)
      removeListener('unhandledrejection', onUnhandledRejection)
    }
  }, [toast])
}
