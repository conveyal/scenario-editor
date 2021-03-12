import Bundles from 'lib/components/bundles'
import SelectBundle from 'lib/components/select-bundle'
import {useBundles} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout<{bundles: CL.Bundle[]}>(
  function BundlesPage(p) {
    return (
      <Bundles regionId={p.query.regionId}>
        <SelectBundle
          bundles={p.bundles}
          key={p.query.bundleId}
          query={p.query}
        />
      </Bundles>
    )
  },
  function useData(p) {
    return {
      bundles: useBundles({query: {regionId: p.query.regionId}})
    }
  }
)
