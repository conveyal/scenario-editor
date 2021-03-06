import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportModifications from 'lib/components/import-modifications'
import {useProjects} from 'lib/hooks/use-collection'
import {useProject} from 'lib/hooks/use-model'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout<{
  project: CL.Project
  projects: CL.Project[]
}>(
  function ImportModificationsPage({project, projects, query}) {
    return (
      <>
        <ProjectTitle project={project} />
        <Dock>
          <ImportModifications
            projects={projects}
            projectId={query.projectId}
            regionId={query.regionId}
          />
        </Dock>
      </>
    )
  },
  function useData(p) {
    return {
      project: useProject(p.query.projectId),
      projects: useProjects({query: {regionId: p.query.regionId}})
    }
  }
)
