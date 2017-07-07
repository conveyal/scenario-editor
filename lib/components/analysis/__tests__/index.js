/* global describe, expect, it, jest */

import React from 'react'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'

import Analysis from '../'

describe('Components > Analysis > Single Point', function () {
  it('should render correctly', function () {
    const props = {
      clearIsochroneResults: jest.fn(),
      deleteRegionalAnalysis: jest.fn(),
      enterAnalysisMode: jest.fn(),
      exitAnalysisMode: jest.fn(),
      fetchIsochrone: jest.fn(),
      loadRegionalAnalyses: jest.fn(),
      removeIsochroneLayerFromMap: jest.fn(),
      removeOpportunityLayerFromMap: jest.fn(),
      runAnalysis: jest.fn(),
      selectRegionalAnalysis: jest.fn(),
      setActiveVariant: jest.fn(),
      setComparisonInProgress: jest.fn(),
      setComparisonScenario: jest.fn(),
      setCurrentIndicator: jest.fn(),
      setIsochroneCutoff: jest.fn(),
      setProfileRequest: jest.fn()
    }
    const tree = mount(<Analysis
      {...props}
      accessibility={0}
      bundleId=''
      comparisonAccessibility={0}
      comparisonBundleId=''
      comparisonInProgress={false}
      comparisonScenarioId=''
      comparisonPercentileCurves={[]}
      comparisonVariant={0}
      currentIndicator=''
      indicators={[]}
      isFetchingIsochrone={false}
      isochroneCutoff={0}
      isochroneFetchStatusMessag=''
      isochroneLonLat={{}}
      isShowingIsochrone={false}
      isShowingOpportunities={false}
      modifications={[]}
      profileRequest={{
        date: '2016-01-16'
      }}
      projectId=''
      scenarioApplicationErrors={[]}
      scenarioId=''
      scenarioName=''
      scenarios={[]}
      percentileCurves={[]}
      variantIndex={0}
      variantName=''
      variants={[]}
      workerVersion=''
      />)
    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
