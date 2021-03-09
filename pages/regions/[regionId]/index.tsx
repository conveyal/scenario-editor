import SelectProject from 'lib/components/select-project'
import {useRegion} from 'lib/hooks/use-model'
import {useBundles, useProjects} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(SelectProject, function useData(p) {
  const {regionId} = p.query
  const bundles = useBundles({query: {regionId}})
  const projects = useProjects({query: {regionId}})
  const region = useRegion(regionId)
  return {
    bundles,
    projects,
    region
  }
})
