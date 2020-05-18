import React from 'react'

import {load as loadRegion} from 'lib/actions/region'
import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportModifications from 'lib/components/import-modifications'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const ImportModificationsPage = withInitialFetch(
  (p) => (
    <>
      <ProjectTitle project={p.project} />
      <Dock className='block'>
        <ImportModifications
          projects={p.projects}
          projectId={p.query.projectId}
          regionId={p.query.regionId}
        />
      </Dock>
    </>
  ),
  async (dispatch, query) => {
    const {regionId, projectId} = query
    const {projects} = await dispatch(loadRegion(regionId))
    return {
      project: projects.find((p) => p._id === projectId),
      projects: projects.filter((p) => p._id !== projectId)
    }
  }
)

ImportModificationsPage.Layout = MapLayout

export default ImportModificationsPage
