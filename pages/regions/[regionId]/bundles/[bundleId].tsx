import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import SelectBundle from 'lib/components/select-bundle'
import {useBundles, useProjects} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout<{
  bundles: CL.Bundle[]
  projects: CL.Project[]
}>(
  function BundleViewPage(p) {
    const bundle = p.bundles.find((b) => b._id === p.query.bundleId)
    return (
      <Bundles regionId={p.query.regionId}>
        <SelectBundle bundles={p.bundles} query={p.query} />
        {bundle && (
          <EditBundle
            bundle={bundle}
            bundles={p.bundles}
            bundleProjects={p.projects}
            query={p.query}
          />
        )}
      </Bundles>
    )
  },
  function useData(p) {
    const {bundleId, regionId} = p.query
    const bundles = useBundles({query: {regionId}})
    const projects = useProjects({query: {bundleId}})
    return {
      bundles,
      projects
    }
  }
)
