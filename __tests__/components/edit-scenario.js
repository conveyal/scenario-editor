/* global jest */

import React from 'react'
import renderer from 'react-test-renderer'

import { basicRenderTest, mockExports } from '../../testUtils/unitUtils'

jest.mock('react-select', () => 'React-Select')
jest.mock('../../lib/components/buttons', () => { return mockExports(['Button']) })
jest.mock('../../lib/components/input', () => { return mockExports(['Group', 'Text']) })
jest.mock('../../lib/components/icon', () => 'Icon')
jest.mock('../../lib/components/panel', () => { return mockExports(['Body', 'Heading', 'Panel']) })

import EditScenario from '../../lib/components/edit-scenario'

const mockBundles = [{ id: 1, name: 'B1' }, { id: 2, name: 'B2' }]

basicRenderTest({
  component: EditScenario,
  name: 'EditScenario',
  notToBeCalledFns: ['close', 'create', 'deleteScenario', 'save'],
  props: {
    bundles: mockBundles,
    close: jest.fn(),
    create: jest.fn(),
    deleteScenario: jest.fn(),
    isEditing: false,
    name: 'Mock Scenario',
    projectId: 'P1',
    variants: [],
    save: jest.fn()
  }
})
