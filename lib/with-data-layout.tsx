import Head from 'next/head'
import dynamic from 'next/dynamic'
import {FunctionComponent} from 'react'

import FullSpinner from 'lib/components/full-spinner'
import {UseDataResponse} from 'lib/hooks/use-data'
import DefaultLayout from 'lib/layouts/map'

const ErrorAlert = dynamic(
  () => import('lib/components/connection-error-alert')
)

type WithInitialDataProps<Props> = Partial<Props> & {
  query: Record<string, string>
}

export type UseDataResults<Props> = {
  [Property in keyof Omit<Props, 'query'>]: UseDataResponse<Props[Property]>
}

export type UseDataFn<Props> = (
  p: WithInitialDataProps<Props>
) => UseDataResults<Props>

function urlsFromResults<T>(results: UseDataResults<T>) {
  const urls: string[] = []
  for (const k in results) {
    urls.push(results[k].url)
  }
  return urls
}
function dataIsMissing<T>(results: UseDataResults<T>) {
  for (const k in results) {
    if (results[k].data == null) return true
  }
  return false
}
function dataContainsError<T>(results: UseDataResults<T>) {
  for (const k in results) {
    if (results[k].error != null) return results[k].error
  }
  return false
}
function dataFromResults<Props>(results: UseDataResults<Props>): Props {
  // TODO, figure out how to use a real Type here
  const returns: any = {}
  for (const k in results) {
    returns[k] = results[k].data
  }
  return returns as Props
}

/**
 * Many pages have the same style of data requirements before rendering. This helps reduce boilerplate
 * while enforcing useful type safety around the components.
 *
 * @param Component Next.js page component
 * @param useData React hook that returns an key/value object of
 * @param Layout Optional layout to be used by _app.
 * @returns A React componenet ready to be used as a Next.js page.
 */
export default function withDataLayout<Props>(
  PageComponent: FunctionComponent<Props>,
  useData: UseDataFn<Props>,
  Layout = DefaultLayout
): CL.Page<Props> {
  function DataLoader(props: WithInitialDataProps<Props>) {
    const results = useData(props)

    // If any results are missing, show the spinner and add the preload tags (for SSR).
    // Any page that does not preload data with `getServerSideProps` will show this on initial render.
    if (dataIsMissing(results)) {
      const urls = urlsFromResults(results)
      return (
        <>
          <Head>
            {urls.map((url) => (
              <link key={url} rel='preload' as='fetch' href={url} />
            ))}
          </Head>
          <FullSpinner />
        </>
      )
    }

    // If any of the results contains an error, show the error
    const error = dataContainsError(results)
    if (error) return <ErrorAlert>{error.message}</ErrorAlert>

    // Convert the reponse objects to the data themselves and pass as props to the component
    return <PageComponent {...props} {...dataFromResults(results)} />
  }

  // Layout to be used by _app. Set this way so that the Layout doesn't need a full re-render on page change.
  DataLoader.Layout = Layout

  return DataLoader
}
