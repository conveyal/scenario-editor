import Bundles from 'lib/components/bundles'
import MapLayout from 'lib/layouts/map'
import SelectBundle from 'lib/components/select-bundle'
import {useBundles} from 'lib/hooks/use-collection'

function BundlesPage(p: {query: CL.Query}) {
  const {data: bundles} = useBundles({query: {regionId: p.query.regionId}})
  return (
    <Bundles regionId={p.query.regionId}>
      <SelectBundle bundles={bundles ?? []} query={p.query} />
    </Bundles>
  )
}

BundlesPage.Layout = MapLayout

export default BundlesPage
