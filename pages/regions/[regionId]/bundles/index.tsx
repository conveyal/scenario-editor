import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import {useBundles} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(
  function BundlesPage(p: {
    bundles: CL.Bundle[]
    query: Record<string, string>
  }) {
    return (
      <Bundles regionId={p.query.regionId}>
        <EditBundle bundleProjects={[]} bundles={p.bundles} />
      </Bundles>
    )
  },
  function useData(p) {
    return {
      bundles: useBundles({query: {regionId: p.query.regionId}})
    }
  }
)
