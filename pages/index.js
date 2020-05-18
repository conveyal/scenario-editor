import {clear, loadAll} from 'lib/actions/region'
import SelectRegion from 'lib/components/select-region'
import withAuth from 'lib/with-auth'
import withInitialFetch from 'lib/with-initial-fetch'
import withRedux from 'lib/with-redux'

const SelectRegionPage = withInitialFetch(SelectRegion, async (dispatch) => {
  // If navigating to this page, reset the and clear region specific data.
  // This is important for the application behaving correctly after switching.
  dispatch(clear())

  // Load all regions
  return {regions: await dispatch(loadAll())}
})

export default withAuth(withRedux(SelectRegionPage))
