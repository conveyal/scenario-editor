/* global describe, it, expect, jest */

describe('Component > VariantEditor', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const VariantEditor = require('../variant-editor')

  it('renders correctly', () => {
    const props = {
      analyzeVariant: jest.fn(),
      createVariant: jest.fn(),
      currentScenario: {},
      modifications: [],
      saveScenario: jest.fn(),
      scenario: {
        id: '1',
        name: 'Test Scenario',
        projectId: '1',
        variants: []
      },
      showVariant: jest.fn(),
      updateVariant: jest.fn()
    }

    // mount component
    const tree = renderer.create(
      <VariantEditor
        {...props}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    const noCalls = [
      'createVariant',
      'saveScenario',
      'showVariant',
      'updateVariant'
    ]
    noCalls.forEach((fn) => {
      expect(props[fn]).not.toBeCalled()
    })
  })
})
