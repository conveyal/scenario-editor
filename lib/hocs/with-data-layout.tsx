import {FunctionComponent} from 'react'
import DefaultLayout from 'lib/layouts/map'

import withData, {IResults, UseDataFn, WithInitialDataProps} from './with-data'

/**
 * Many pages have the same style of data requirements before rendering. This helps reduce boilerplate
 * while enforcing useful type safety around the components.
 *
 * @param Layout Optional layout to be used by _app.
 * @returns A React componenet ready to be used as a Next.js page.
 */
export default function withDataLayout<Results extends IResults>(
  PageComponent: FunctionComponent<Results & {query?: CL.Query}>,
  useData: UseDataFn<Results>,
  Layout = DefaultLayout
): CL.Page<WithInitialDataProps<Results>> {
  const DataLoaderWithLayout = withData(PageComponent, useData)

  // Layout to be used by _app. Set this way so that the Layout doesn't need a full re-render on page change.
  DataLoaderWithLayout.Layout = Layout

  return DataLoaderWithLayout
}
