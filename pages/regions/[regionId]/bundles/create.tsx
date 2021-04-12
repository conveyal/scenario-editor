import CreateBundle from 'lib/components/create-bundle'
import MapLayout from 'lib/layouts/map'

export default function CreateBundlePage(p) {
  return <CreateBundle query={p.query} />
}

CreateBundlePage.Layout = MapLayout
