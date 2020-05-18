import {loadBundles} from 'lib/actions'
import CreateProject from 'lib/components/create-project'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const CreateProjectPage = withInitialFetch(
  CreateProject,
  async (dispatch, query) => {
    const bundles = await dispatch(loadBundles({regionId: query.regionId}))
    return {bundles}
  }
)

CreateProjectPage.Layout = MapLayout

export default CreateProjectPage
