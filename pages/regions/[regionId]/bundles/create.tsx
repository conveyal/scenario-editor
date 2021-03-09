import CreateBundle from 'lib/components/create-bundle'
import {useBundles} from 'lib/hooks/use-collection'
import {useRegion} from 'lib/hooks/use-model'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(CreateBundle, function useData(p) {
  const {regionId} = p.query
  const bundles = useBundles({query: {regionId}})
  const region = useRegion(regionId)

  return {
    bundles,
    region
  }
})
