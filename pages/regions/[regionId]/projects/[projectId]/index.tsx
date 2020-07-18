import find from 'lodash/find'
import get from 'lodash/get'
import {useSelector} from 'react-redux'

import {loadBundles} from 'lib/actions'
import {loadProject, loadProjects} from 'lib/actions/project'
import {loadRegion} from 'lib/actions/region'
import List from 'lib/components/modification/list'
import ProjectTitle from 'lib/components/project-title'
import SelectProject from 'lib/components/select-project'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const noProjectId = (pid) => !pid || pid === 'undefined'

/**
 * Show Select Project if a project has not been selected
 */
const ModificationsPage: any = withInitialFetch(
  (p) => {
    const project = useSelector((s) =>
      find(get(s, 'project.projects'), ['_id', p.query.projectId])
    )
    if (!project) {
      return <SelectProject {...p} />
    } else {
      return (
        <>
          <ProjectTitle project={project} />
          <List project={project} />
        </>
      )
    }
  },
  async (dispatch, query) => {
    const {projectId, regionId} = query
    if (noProjectId(projectId)) {
      const [region, bundles, projects] = await Promise.all([
        dispatch(loadRegion(regionId)),
        dispatch(loadBundles({regionId})),
        dispatch(loadProjects({regionId}))
      ])
      return {bundles, projects, region}
    } else {
      return {project: await dispatch(loadProject(projectId))}
    }
  }
)

ModificationsPage.Layout = MapLayout

export default ModificationsPage
