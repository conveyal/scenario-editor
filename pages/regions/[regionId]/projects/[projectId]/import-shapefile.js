import React from 'react'

import {loadProject} from 'lib/actions/project'
import {load as loadRegion} from 'lib/actions/region'
import Dock from 'lib/components/inner-dock'
import ProjectTitle from 'lib/components/project-title'
import ImportShapefile from 'lib/components/import-shapefile'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const ImportShapeFilePage = withInitialFetch(
  (p) => (
    <>
      <ProjectTitle project={p.project} />
      <Dock className='block'>
        <ImportShapefile
          projectId={p.query.projectId}
          regionId={p.query.regionId}
          variants={p.project.variants}
        />
      </Dock>
    </>
  ),
  async (dispatch, query) => ({
    region: await dispatch(loadRegion(query.regionId)),
    project: await dispatch(loadProject(query.projectId))
  })
)

ImportShapeFilePage.Layout = MapLayout

export default ImportShapeFilePage
