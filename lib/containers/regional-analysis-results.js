import fetch from '../fetch-action'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import {connect} from 'react-redux'

import {updateRegionalAnalysis} from 'lib/actions/analysis/regional'

const RegionalAnalysis = dynamic(
  () => import('lib/components/analysis/regional'),
  {
    ssr: false
  }
)

function mapStateToProps(state) {
  return {
    origin: get(state, 'analysis.regional.origin')
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetch: opts => dispatch(fetch(opts)),
    updateRegionalAnalysis: a => dispatch(updateRegionalAnalysis(a))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegionalAnalysis)
