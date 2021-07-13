import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportShapefile from 'lib/components/import-shapefile'
import {useProject} from 'lib/hooks/use-model'
import withDataLayout from 'lib/hocs/with-data-layout'

export default withDataLayout<{project: CL.Project}>(
  function ImportShapeFilePage(p) {
    return (
      <>
        <ProjectTitle project={p.project} />
        <Dock>
          <ImportShapefile />
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
