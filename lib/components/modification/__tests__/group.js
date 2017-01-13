/* global describe, it, expect, jest */

import renderer from 'react-test-renderer'
import React from 'react'

import { mockModification } from '../../../utils/mock-data'
import {ADD_TRIP_PATTERN} from '../../../utils/modification-types'

import ModificationGroup from '../group'

describe('Component > Modification > ModificationGroup', () => {
  it('renders correctly', () => {
    const replaceModificationFn = jest.fn()
    const tree = renderer.create(
      <ModificationGroup
        activeModification={mockModification}
        create={jest.fn()}
        modifications={[mockModification]}
        editModification={jest.fn()}
        projectId='1234'
        replaceModification={replaceModificationFn}
        scenarioId='1234'
        type={ADD_TRIP_PATTERN}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled()
  })
})
