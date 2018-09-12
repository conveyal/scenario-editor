// @flow
import React from 'react'

import {mockWithProvider, mockGrid, mockRegionalAnalyses} from '../../../utils/mock-data'
import Regional from '../regional-results'

describe('Components > Analysis > Regional', () => {
  it('should render correctly', () => {
    const setActiveRegionalAnalysis = jest.fn()
    const {snapshot} = mockWithProvider(
      <Regional
        accessToName='Grid name'
        aggregationAreas={[]}
        analysis={mockRegionalAnalyses[0]}
        analysisId={mockRegionalAnalyses[0]._id}
        breaks={[100, 500, 1000, 2000]}
        opportunityDatasets={[{name: 'Total jobs', _id: 'Jobs_total'}]}
        minimumImprovementProbability={0.83}
        regionId='MOCK_REGION_ID'
        projectId='MOCK_PROJECT_ID'
        grid={mockGrid}
        regionalAnalyses={mockRegionalAnalyses}
        scenarioId='MOCK'
        // actions
        deleteAnalysis={jest.fn()}
        fetch={jest.fn()}
        loadRegionalAnalyses={jest.fn()}
        loadRegionalAnalysisGrids={jest.fn()}
        setActiveRegionalAnalysis={setActiveRegionalAnalysis}
        setAggregationArea={jest.fn()}
        setAggregationWeights={jest.fn()}
        setMinimumImprovementProbability={jest.fn()}
        uploadAggregationArea={jest.fn()}
      />
    )

    expect(snapshot()).toMatchSnapshot()
  })

  it('should handle rendering comparison', () => {
    const setActiveRegionalAnalysis = jest.fn()
    const setMinimumImprovementProbability = jest.fn()
    const {wrapper, snapshot} = mockWithProvider(
      <Regional
        accessToName='Grid name'
        aggregationAreas={[]}
        analysis={mockRegionalAnalyses[0]}
        analysisId={mockRegionalAnalyses[0]._id}
        breaks={[100, 500, 1000, 2000]}
        comparisonAnalysis={mockRegionalAnalyses[1]}
        differenceGrid={mockGrid}
        grid={mockGrid}
        minimumImprovementProbability={0.83}
        opportunityDatasets={[{name: 'Total jobs', _id: 'Jobs_total'}]}
        projectId='MOCK_PROJECT_ID'
        regionId='MOCK_REGION_ID'
        regionalAnalyses={mockRegionalAnalyses}
        scenarioId='MOCK'
        // actions
        deleteAnalysis={jest.fn()}
        fetch={jest.fn()}
        loadRegionalAnalyses={jest.fn()}
        loadRegionalAnalysisGrids={jest.fn()}
        setActiveRegionalAnalysis={setActiveRegionalAnalysis}
        setAggregationArea={jest.fn()}
        setAggregationWeights={jest.fn()}
        setMinimumImprovementProbability={setMinimumImprovementProbability}
        uploadAggregationArea={jest.fn()}
      />
    )

    wrapper.find('input[type="range"]').simulate('change', {target: {value: 0.55}})

    expect(snapshot()).toMatchSnapshot()
    expect(setMinimumImprovementProbability).toHaveBeenLastCalledWith(0.55)
  })
})
