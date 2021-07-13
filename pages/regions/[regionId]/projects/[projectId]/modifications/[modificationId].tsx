import dynamic from 'next/dynamic'

import withDataLayout from 'lib/hocs/with-data-layout'
import {useBundle, useModification, useProject} from 'lib/hooks/use-model'

// Lots of the ModificationEditor code depends on Leaflet. Load it all client side
const ModificationEditor = dynamic(
  () => import('lib/components/modification/editor'),
  {ssr: false}
)

export default withDataLayout<{
  bundle: CL.Bundle
  project: CL.Project
  modification: CL.Modification
}>(
  function Editor(p) {
    return (
      <ModificationEditor
        bundle={p.bundle}
        key={p.modification._id}
        modification={p.modification}
        project={p.project}
        query={p.query}
      />
    )
  },
  function useData({query}) {
    const project = useProject(query.projectId)
    return {
      bundle: useBundle(project.data?.bundleId),
      modification: useModification(query.modificationId),
      project
    }
  }
)
