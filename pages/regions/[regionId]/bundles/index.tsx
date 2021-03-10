import Bundles from 'lib/components/bundles'
import SelectBundle from 'lib/components/select-bundle'
import {useBundles} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(
  function BundlesPage(p: {
    bundles: CL.Bundle[]
    query: Record<string, string>
  }) {
    return (
      <Bundles regionId={p.query.regionId}>
        <SelectBundle bundles={p.bundles} query={p.query} />
      </Bundles>
    )
  },
  function useData(p) {
    return {
      bundles: useBundles({query: {regionId: p.query.regionId}})
    }
  }
)
