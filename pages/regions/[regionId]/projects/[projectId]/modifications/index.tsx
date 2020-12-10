import {loadBundle} from 'lib/actions'
import {getForProject as loadModifications} from 'lib/actions/modifications'
import {loadProject} from 'lib/actions/project'
import List from 'lib/components/modification/list'
import ProjectTitle from 'lib/components/project-title'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

/**
 * Show Select Project if a project has not been selected
 */
const ModificationsPage: any = withInitialFetch(
  ({bundle, project}) => (
    <>
      <ProjectTitle project={project} />
      <List bundle={bundle} project={project} />
    </>
  ),
  async (dispatch, query) => {
    const results = await Promise.all([
      dispatch(loadModifications(query.projectId)),
      dispatch(loadProject(query.projectId))
    ])
    const project = results[1]
    const bundle = await dispatch(loadBundle(project.bundleId))
    return {
      bundle,
      modifications: results[0],
      project
    }
  }
)

ModificationsPage.Layout = MapLayout

export default ModificationsPage
