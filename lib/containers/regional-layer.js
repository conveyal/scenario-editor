// @flow
import get from 'lodash/get'
import {connect} from 'react-redux'

import {setRegionalAnalysisOrigin} from '../actions/analysis/regional'
import RegionalLayer from '../components/map/regional'

const emptyGrid = () => ({
  data: [],
  width: 0,
  height: 0,
  north: 0,
  west: 0,
  zoom: 9
})

function mapStateToProps (state) {
  return {
    baseGrid: get(state, 'analysis.regional.grid', emptyGrid()),
    differenceGrid: get(state, 'analysis.regional.differenceGrid', emptyGrid()),
    probabilityGrid: get(state, 'analysis.regional.probabilityGrid', emptyGrid()),
    minimumImprovementProbability: get(state, 'analysis.regional.minimumImprovementProbability'),
    breaks: get(state, 'analysis.regional.breaks'),
    comparisonId: get(state, 'analysis.regional.comparisonId'),
    _id: get(state, 'analysis.regional._id')
  }
}

const mapDispatchToProps = {
  setRegionalAnalysisOrigin
}

export default connect(mapStateToProps, mapDispatchToProps)(RegionalLayer)
