import List from 'lib/components/modification/list'
import ProjectTitle from 'lib/components/project-title'
import withDataLayout from 'lib/hocs/with-data-layout'
import {useModifications} from 'lib/hooks/use-collection'
import {useBundle, useProject} from 'lib/hooks/use-model'

export default withDataLayout(
  function ProjectPage(p: {
    bundle: CL.Bundle
    modifications: CL.Modification[]
    project: CL.Project
  }) {
    return (
      <>
        <ProjectTitle project={p.project} />
        <List
          bundle={p.bundle}
          modifications={p.modifications}
          project={p.project}
        />
      </>
    )
  },
  function useData({query}) {
    const project = useProject()
    return {
      bundle: useBundle(project.data?.bundleId),
      project,
      modifications: useModifications({query: {projectId: query.projectId}})
    }
  }
)
