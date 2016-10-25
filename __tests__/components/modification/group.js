/* global describe, it, expect, jest */

import { mount } from 'enzyme'
import { mountToJson } from 'enzyme-to-json'
import React from 'react'

import { mockModification } from '../../test-utils/mock-data'

import ModificationGroup from '../../../lib/components/modification/group'

describe('Component > Modification > ModificationGroup', () => {
  it('renders correctly', () => {
    const replaceModificationFn = jest.fn()
    const tree = mount(
      <ModificationGroup
        activeModification={mockModification}
        modifications={[mockModification]}
        projectId='1234'
        replaceModification={replaceModificationFn}
        scenarioId='1234'
        type='test'
        />
    )
    expect(mountToJson(tree)).toMatchSnapshot()
    expect(replaceModificationFn).not.toBeCalled()
  })
})
