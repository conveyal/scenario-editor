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
    origin: get(state, 'analysis.regional.origin'),
    grid: get(state, 'analysis.regional.grid'),
    differenceGrid: get(state, 'analysis.regional.differenceGrid'),
    breaks: get(state, 'analysis.regional.breaks')
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetch: opts => dispatch(fetch(opts)),
    updateRegionalAnalysis: a => dispatch(updateRegionalAnalysis(a))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegionalAnalysis)
