/* global describe, expect, it, jest */

import React from 'react'
import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'

import {mockGrid, mockRegionalAnalyses} from '../../../utils/mock-data'
import Regional from '../regional'

describe('Components > Analysis > Regional', () => {
  it('should render correctly', () => {
    const addRegionalAnalysisLayerToMap = jest.fn()
    const setActiveRegionalAnalysis = jest.fn()
    const tree = mount(<Regional
      analysis={mockRegionalAnalyses[0]}
      analysisId={mockRegionalAnalyses[0].id}
      breaks={[100, 500, 1000, 2000]}
      indicators={[{ name: 'Total jobs', key: 'Jobs_total' }]}
      minimumImprovementProbability={0.83}
      projectId='MOCK'
      grid={mockGrid}
      regionalAnalyses={mockRegionalAnalyses}
      // actions
      addRegionalAnalysisLayerToMap={addRegionalAnalysisLayerToMap}
      addRegionalComparisonLayerToMap={jest.fn()}
      fetch={jest.fn()}
      loadRegionalAnalyses={jest.fn()}
      removeRegionalAnalysisLayerFromMap={jest.fn()}
      removeRegionalComparisonLayerFromMap={jest.fn()}
      setActiveRegionalAnalysis={setActiveRegionalAnalysis}
      setMinimumImprovementProbability={jest.fn()}
      />)

    expect(mountToJson(tree)).toMatchSnapshot()

    expect(addRegionalAnalysisLayerToMap).toHaveBeenCalledTimes(1)
    expect(setActiveRegionalAnalysis).toHaveBeenLastCalledWith({ id: mockRegionalAnalyses[0].id })
  })

  it('should load analysis if it is not loaded', () => {
    const addRegionalAnalysisLayerToMap = jest.fn()
    const setActiveRegionalAnalysis = jest.fn()
    const loadRegionalAnalyses = jest.fn()
    const tree = mount(<Regional
      regionalAnalyses={mockRegionalAnalyses}
      analysisId={mockRegionalAnalyses[0].id}
      projectId='MOCK'
      indicators={[{ name: 'Total jobs', key: 'Jobs_total' }]}
      grid={mockGrid}
      breaks={[100, 500, 1000, 2000]}
      minimumImprovementProbability={0.83}
      // actions
      addRegionalAnalysisLayerToMap={addRegionalAnalysisLayerToMap}
      addRegionalComparisonLayerToMap={jest.fn()}
      fetch={jest.fn()}
      loadRegionalAnalyses={loadRegionalAnalyses}
      removeRegionalAnalysisLayerFromMap={jest.fn()}
      removeRegionalComparisonLayerFromMap={jest.fn()}
      setActiveRegionalAnalysis={setActiveRegionalAnalysis}
      setMinimumImprovementProbability={jest.fn()}
      />)

    expect(mountToJson(tree)).toMatchSnapshot()

    expect(addRegionalAnalysisLayerToMap).toHaveBeenCalledTimes(1)
    expect(setActiveRegionalAnalysis).toHaveBeenLastCalledWith({ id: mockRegionalAnalyses[0].id })
    expect(loadRegionalAnalyses).toHaveBeenLastCalledWith('MOCK')
  })

  it('should handle rendering comparison', () => {
    const addRegionalAnalysisLayerToMap = jest.fn()
    const setActiveRegionalAnalysis = jest.fn()
    const setMinimumImprovementProbability = jest.fn()
    const tree = mount(<Regional
      regionalAnalyses={mockRegionalAnalyses}
      analysis={mockRegionalAnalyses[0]}
      comparisonAnalysis={mockRegionalAnalyses[1]}
      analysisId={mockRegionalAnalyses[0].id}
      projectId='MOCK'
      indicators={[{ name: 'Total jobs', key: 'Jobs_total' }]}
      grid={mockGrid}
      differenceGrid={mockGrid}
      breaks={[100, 500, 1000, 2000]}
      minimumImprovementProbability={0.83}
      // actions
      addRegionalAnalysisLayerToMap={addRegionalAnalysisLayerToMap}
      addRegionalComparisonLayerToMap={jest.fn()}
      fetch={jest.fn()}
      loadRegionalAnalyses={jest.fn()}
      removeRegionalAnalysisLayerFromMap={jest.fn()}
      removeRegionalComparisonLayerFromMap={jest.fn()}
      setActiveRegionalAnalysis={setActiveRegionalAnalysis}
      setMinimumImprovementProbability={setMinimumImprovementProbability}
      />)

    tree.find('input[type="range"]').simulate('change', { target: { value: 0.55 } })

    expect(mountToJson(tree)).toMatchSnapshot()
    expect(setMinimumImprovementProbability).toHaveBeenLastCalledWith(0.55)
  })
})
