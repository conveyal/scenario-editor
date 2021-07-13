import dynamic from 'next/dynamic'
import {FunctionComponent} from 'react'

import FullSpinner from 'lib/components/full-spinner'
import {UseDataResponse} from 'lib/hooks/use-data'

const ErrorAlert = dynamic(
  () => import('lib/components/connection-error-alert')
)

export interface IResults {
  [key: string]: CL.IModel | CL.IModel[] | CL.Activity | CL.RegionalJob[]
}

export type WithInitialDataProps<Props> = Partial<Props> & {
  query: Record<string, string>
}

export type UseDataResults<Results extends IResults> = {
  [Property in keyof Results]: UseDataResponse<Results[Property]>
}

export type UseDataFn<Props extends IResults> = (
  p: WithInitialDataProps<Props>
) => UseDataResults<Props>

function dataIsMissing<T extends IResults>(results: UseDataResults<T>) {
  for (const k in results) {
    if (results[k].data == null) return true
  }
  return false
}
function dataContainsError<T extends IResults>(results: UseDataResults<T>) {
  for (const k in results) {
    if (results[k].error != null) return results[k].error
  }
  return false
}
function dataFromResults<T extends IResults>(results: UseDataResults<T>): T {
  // TODO, figure out how to use a real Type here
  const returns: IResults = {}
  for (const k in results) {
    returns[k] = results[k].data
  }
  return returns as T
}

/**
 * Many pages have the same style of data requirements before rendering. This helps reduce boilerplate
 * while enforcing useful type safety around the components.
 *
 * @param Component Next.js page component
 * @param useData React hook that returns an key/value object of
 */
export default function withData<Results extends IResults>(
  PageComponent: FunctionComponent<Results & {query?: CL.Query}>,
  useData: UseDataFn<Results>
): CL.Page<WithInitialDataProps<Results>> {
  return function DataLoader(props) {
    const results = useData(props)

    // If any results are missing, show the spinner.
    if (dataIsMissing(results)) return <FullSpinner />

    // If any of the results contains an error, show the error
    const error = dataContainsError(results)
    if (error) return <ErrorAlert>{error.message}</ErrorAlert>

    // Convert the reponse objects to the data themselves and pass as props to the component
    return <PageComponent {...props} {...dataFromResults(results)} />
  }
}
