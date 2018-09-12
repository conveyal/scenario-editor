// @flow

import React from 'react'
import renderer from 'react-test-renderer'

import Regional from '../regional-analysis-selector'
import {mockRegionalAnalyses} from '../../../utils/mock-data'

describe('Components > Analysis > Regional Analysis Selector', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Regional
          allAnalyses={mockRegionalAnalyses}
          deleteAnalysis={jest.fn()}
          goToAnalysis={jest.fn()}
        />
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
