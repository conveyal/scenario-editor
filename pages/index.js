import {clear, loadAll} from 'lib/actions/region'
import SelectRegion from 'lib/components/select-region'
import withInitialFetch from 'lib/with-initial-fetch'

async function initialFetch(store) {
  // If navigating to this page, reset the store and clear region specific data.
  // This is important for the application behaving correctly after switching.
  store.dispatch(clear())

  // Load all regions
  const regions = await store.dispatch(loadAll())
  return {regions}
}

export default withInitialFetch(SelectRegion, initialFetch)
