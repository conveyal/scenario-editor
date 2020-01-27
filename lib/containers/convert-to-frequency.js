import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'

import ConvertToFrequency from 'lib/components/modification/convert-to-frequency'
import * as select from 'lib/selectors'

export default connect(
  createStructuredSelector({
    feeds: select.feedsWithBundleNames,
    feedScopedModificationStops: select.feedScopedModificationStops,
    projectTimetables: select.projectTimetables,
    routePatterns: select.routePatterns,
    selectedFeed: select.modificationFeed
  })
)(ConvertToFrequency)
