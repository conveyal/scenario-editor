import find from 'lodash/find'
import React from 'react'
import {useSelector} from 'react-redux'

import {loadBundles} from 'lib/actions'
import {loadProject, loadProjects} from 'lib/actions/project'
import {loadRegion} from 'lib/actions/region'
import List from 'lib/components/modification/list'
import ProjectTitle from 'lib/components/project-title'
import SelectProject from 'lib/components/select-project'
import withInitialFetch from 'lib/with-initial-fetch'

const noProjectId = pid => !pid || pid === 'undefined'

/**
 * Show Select Project if a project has not been selected
 */
function Modifications(p) {
  const project = useSelector(s =>
    find(s.project.projects, ['_id', p.query.projectId])
  )
  if (!project) {
    return <SelectProject {...p} />
  } else {
    return (
      <>
        <ProjectTitle project={project} />
        <List project={project} setMapChildren={p.setMapChildren} />
      </>
    )
  }
}

/**
 * Populates props with bundle, feeds, modifications, and project.
 */
async function initialFetch(store, query) {
  const {projectId, regionId} = query
  if (noProjectId(projectId)) {
    const [region, bundles, projects] = await Promise.all([
      store.dispatch(loadRegion(regionId)),
      store.dispatch(loadBundles({regionId})),
      store.dispatch(loadProjects({regionId}))
    ])
    return {bundles, projects, region}
  } else {
    return {project: await store.dispatch(loadProject(projectId))}
  }
}

export default withInitialFetch(Modifications, initialFetch, {clientOnly: true})
