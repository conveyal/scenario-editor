import {Stack} from '@chakra-ui/react'
import Bundles from 'lib/components/bundles'
import EditBundle from 'lib/components/edit-bundle'
import SelectBundle from 'lib/components/select-bundle'
import {useBundles, useProjects} from 'lib/hooks/use-collection'
import MapLayout from 'lib/layouts/map'

function BundleViewPage(p: {query: CL.Query}) {
  const {data: bundles} = useBundles({
    query: {regionId: p.query.regionId}
  })
  const {data: projects} = useProjects({query: {regionId: p.query.regionId}})
  const bundle = bundles?.find((b) => b._id === p.query.bundleId)
  return (
    <Bundles regionId={p.query.regionId}>
      <Stack spacing={8} shouldWrapChildren>
        {bundles && (
          <SelectBundle
            bundles={bundles}
            key={p.query.bundleId}
            query={p.query}
          />
        )}
        {bundle && projects && (
          <EditBundle
            bundleProjects={projects.filter((p) => p.bundleId === bundle._id)}
            key={p.query.bundleId}
            originalBundle={bundle}
            regionId={p.query.regionId}
          />
        )}
      </Stack>
    </Bundles>
  )
}

BundleViewPage.Layout = MapLayout

export default BundleViewPage
