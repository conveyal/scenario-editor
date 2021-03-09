import CreateProject from 'lib/components/create-project'
import {useBundles} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(CreateProject, function useData(p) {
  return {
    bundles: useBundles({query: {regionId: p.query.regionId}})
  }
})
