import {loadRegion} from 'lib/actions/region'
import EditRegion from 'lib/components/edit-region'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const EditRegionPage = withInitialFetch(EditRegion, async (dispatch, query) => {
  const region = await dispatch(loadRegion(query.regionId))
  return {region}
})

EditRegionPage.Layout = MapLayout

export default EditRegionPage
