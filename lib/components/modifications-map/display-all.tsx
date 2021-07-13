import dynamic from 'next/dynamic'

import useModificationsOnMap from 'lib/modification/hooks/use-modifications-on-map'
import {useModifications} from 'lib/hooks/use-collection'
import useCurrentBundle from 'lib/hooks/use-current-bundle'
import useCurrentProject, {
  useCurrentProjectId
} from 'lib/hooks/use-current-project'

const Display = dynamic(() => import('./display'), {ssr: false})

export function DisplayAll({
  bundle,
  isEditing = false,
  modifications
}: {
  bundle: CL.Bundle
  isEditing?: boolean
  modifications: CL.Modification[]
}) {
  return (
    <>
      {modifications.map((m) => (
        <Display dim={isEditing} bundle={bundle} key={m._id} modification={m} />
      ))}
    </>
  )
}

export default function ConnectedDisplayAll({
  isEditingId
}: {
  isEditingId?: string | boolean
}) {
  const projectId = useCurrentProjectId()
  const project = useCurrentProject()
  const bundle = useCurrentBundle()
  const {data: modifications} = useModifications({
    query: {projectId: projectId}
  })
  const modificationsOnMap = useModificationsOnMap()
  const ids = modificationsOnMap.state[projectId] ?? []

  return bundle && project ? (
    <DisplayAll
      bundle={bundle}
      isEditing={!!isEditingId}
      modifications={modifications.filter(
        (m) => m._id !== isEditingId && ids.includes(m._id)
      )}
    />
  ) : null
}
