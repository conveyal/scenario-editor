import {load} from 'lib/actions/region'
import SelectProject from 'lib/components/select-project'
import MapLayout from 'lib/layouts/map'
import withInitialFetch from 'lib/with-initial-fetch'

const SelectProjectPage = withInitialFetch(SelectProject, (dispatch, query) => {
  return dispatch(load(query.regionId))
})

SelectProjectPage.Layout = MapLayout

export default SelectProjectPage
