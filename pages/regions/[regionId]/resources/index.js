import {loadAllResources} from 'lib/actions/resources'
import SelectResource from 'lib/components/select-resource'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const SelectResourcePage = withInitialFetch(
  SelectResource,
  async (dispatch, query) => {
    return {
      resources: await dispatch(loadAllResources(query))
    }
  }
)

SelectResourcePage.Layout = MapLayout

export default SelectResourcePage
