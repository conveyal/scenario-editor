import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportModifications from 'lib/components/import-modifications'
import {useProjects} from 'lib/hooks/use-collection'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout<{projects: CL.Project[]}>(
  function ImportModificationsPage({projects, query}) {
    return (
      <>
        <ProjectTitle
          project={projects.find((p) => p._id === query.projectId)}
        />
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
      projects: useProjects({query: {regionId: p.query.regionId}})
    }
  }
)
