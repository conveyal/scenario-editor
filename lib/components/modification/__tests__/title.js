/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import { mockModification } from '../../../utils/mock-data'

import Title from '../title'

describe('Component > Modification > Scenario', () => {
  it('renders correctly', () => {
    const replaceModificationFn = jest.fn()
    const tree = renderer.create(
      <Title
        active
        editModification={jest.fn()}
        modification={mockModification}
        name='Title'
        projectId='1234'
        replaceModification={replaceModificationFn}
        scenarioId='1234'
        showOnMap
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled()
  })
})
