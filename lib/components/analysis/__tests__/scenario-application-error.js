/* global describe, expect, it */

import React from 'react'
import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import ScenarioApplicationError from '../scenario-application-error'
import {mockScenarioApplicationError} from '../../../utils/mock-data'

describe('Components > Analysis > Scenario Application Error', () => {
  it('should render correctly', () => {
    const tree = mount(<ScenarioApplicationError error={mockScenarioApplicationError} />)
    // unfold the collapsible
    tree.find('[role="button"]').simulate('click')
    expect(mountToJson(tree)).toMatchSnapshot()
  })
})
