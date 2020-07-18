import {loadProject} from 'lib/actions/project'
import List from 'lib/components/modification/list'
import ProjectTitle from 'lib/components/project-title'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

/**
 * Show Select Project if a project has not been selected
 */
const ModificationsPage: any = withInitialFetch(
  ({project}) => (
    <>
      <ProjectTitle project={project} />
      <List project={project} />
    </>
  ),
  async (dispatch, query) => ({
    project: await dispatch(loadProject(query.projectId))
  })
)

ModificationsPage.Layout = MapLayout

export default ModificationsPage
