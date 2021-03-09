import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportShapefile from 'lib/components/import-shapefile'
import {useProject} from 'lib/hooks/use-model'
import withDataLayout from 'lib/with-data-layout'

export default withDataLayout(
  function ImportShapeFilePage(p: {
    project: CL.Project
    query: Record<string, string>
  }) {
    return (
      <>
        <ProjectTitle project={p.project} />
        <Dock>
          <ImportShapefile
            projectId={p.query.projectId}
            regionId={p.query.regionId}
            variants={p.project.variants}
          />
        </Dock>
      </>
    )
  },
  function useData(p) {
    return {
      project: useProject(p.query.projectId)
    }
  }
)
