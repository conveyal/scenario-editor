import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import {useBundles, useProjects} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(
  function BundleViewPage(p: {
    bundles: CL.Bundle[]
    projects: CL.Project[]
    query: Record<string, string>
  }) {
    return (
      <Bundles regionId={p.query.regionId}>
        <EditBundle
          bundles={p.bundles}
          bundleProjects={p.projects}
          key={p.query.bundleId}
        />
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
