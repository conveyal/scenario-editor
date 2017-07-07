import {connect} from 'react-redux'

import {saveToServer, showVariant, updateVariant} from '../actions/scenario'
import VariantEditor from '../components/variant-editor'

function mapStateToProps (state, ownProps) {
  return {
    feeds: state.scenario.feeds
  }
}

function mapDispatchToProps (dispatch) {
  return {
    saveScenario: (scenario) => dispatch(saveToServer(scenario)),
    showVariant: (index) => dispatch(showVariant(index)),
    updateVariant: (opts) => dispatch(updateVariant(opts))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VariantEditor)
