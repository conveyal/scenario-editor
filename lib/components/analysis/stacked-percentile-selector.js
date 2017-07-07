/** A component allowing toggling between up to two stacked percentile plots and comparisons of said */

import React, { Component, PropTypes } from 'react'
import StackedPercentile from './stacked-percentile'
import messages from '../../utils/messages'
import {Group as ButtonGroup, RadioButton} from '../buttons'
import colors from '../../constants/colors'

export const SCENARIO = 'scenario'
export const BASE = 'base'
export const COMPARISON = 'comparison'

const GRAPH_HEIGHT = 300
const GRAPH_WIDTH = 600

export default class StackedPercentileSelector extends Component {
  static propTypes = {
    percentileCurves: PropTypes.array.isRequired,
    comparisonPercentileCurves: PropTypes.array,
    scenarioName: PropTypes.string.isRequired,
    comparisonScenarioName: PropTypes.string,
    indicatorName: PropTypes.string,
    setIsochroneCutoff: PropTypes.func.isRequired,
    isFetchingIsochrone: PropTypes.bool.isRequired
  }

  state = {
    selection: SCENARIO
  }

  render () {
    const { comparisonPercentileCurves } = this.props

    return <div>
      {/* Only show selector when doing a comparison */}
      {comparisonPercentileCurves && this.renderViewSelector()}
      {this.renderStackedPercentiles()}
      {this.renderCutoffSlider()}
    </div>
  }

  /** Select the stacked percentile plot for the scenario being analyzed */
  selectScenario = (e) => {
    if (e.target.checked) this.setState({selection: SCENARIO})
  }

  /** Select the stacked percentile plot for the comparison */
  selectComparison = (e) => {
    if (e.target.checked) this.setState({selection: BASE})
  }

  /** Select the stacked percentile plot for the difference between the two scenarios */
  selectDifference = (e) => {
    if (e.target.checked) this.setState({selection: COMPARISON})
  }

  /** Render the toggle between scenario 1, 2 and the difference */
  renderViewSelector () {
    const { scenarioName, comparisonScenarioName } = this.props

    return <ButtonGroup>
      <RadioButton
        checked={this.state.selection === SCENARIO}
        onChange={this.selectScenario}
        name='selection'
        size='sm'
        value={SCENARIO}>
        {scenarioName}
      </RadioButton>
      <RadioButton
        checked={this.state.selection === BASE}
        onChange={this.selectComparison}
        name='selection'
        size='sm'
        value={SCENARIO}>
        {comparisonScenarioName}
      </RadioButton>
      <RadioButton
        checked={this.state.selection === COMPARISON}
        onChange={this.selectDifference}
        name='selection'
        size='sm'
        value={SCENARIO}>
        {messages.analysis.comparison}
      </RadioButton>
    </ButtonGroup>
  }

  /** Render the stacked percentile plot itself */
  renderStackedPercentiles () {
    const { isFetchingIsochrone, percentileCurves, comparisonPercentileCurves, isochroneCutoff, indicatorName, scenarioName, comparisonScenarioName } = this.props
    const { selection } = this.state

    // compute max value
    const maxAccessibility = comparisonPercentileCurves
      ? Math.max(computeMaxAccessibility(percentileCurves), computeMaxAccessibility(comparisonPercentileCurves))
      : computeMaxAccessibility(percentileCurves)

    const scenarioColor = isFetchingIsochrone
      ? colors.STALE_PERCENTILE_COLOR
      : colors.SCENARIO_PERCENTILE_COLOR
    const comparisonColor = isFetchingIsochrone
      ? colors.STALE_PERCENTILE_COLOR
      : colors.COMPARISON_PERCENTILE_COLOR

    return <StackedPercentile
      percentileCurves={percentileCurves}
      comparisonPercentileCurves={comparisonPercentileCurves}
      width={GRAPH_WIDTH}
      height={GRAPH_HEIGHT}
      isochroneCutoff={isochroneCutoff}
      indicator={indicatorName}
      scale={this.state.scale}
      textColor={'#444444'}
      color={scenarioColor}
      comparisonColor={comparisonColor}
      maxAccessibility={maxAccessibility}
      selected={selection}
      label={scenarioName}
      comparisonLabel={comparisonScenarioName}
      />
  }

  setIsochroneCutoff = (e) => this.props.setIsochroneCutoff(parseInt(e.target.value))

  renderCutoffSlider () {
    const { isochroneCutoff } = this.props
    return <input
      type='range'
      value={isochroneCutoff}
      min={1}
      max={120}
      title={messages.analysis.cutoff}
      onChange={this.setIsochroneCutoff}
      style={{
        width: 540,
        position: 'relative',
        left: 60
      }}
      />
  }
}

/** compute the maximum value of stacked percentiles */
function computeMaxAccessibility (data) {
  // TODO held over from spectrogram data, but we know which value is the highest, it's the 120th
  // minute of the lowest percentile travel time
  return Math.max(...data.map(iteration => Math.max(...iteration)))
}
