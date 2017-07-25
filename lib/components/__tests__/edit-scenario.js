/* global describe, it, expect, jest */

describe('Component > EditScenario', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const EditScenario = require('../edit-scenario')

  it('renders correctly', () => {
    const mockBundles = [{ id: 1, name: 'B1' }, { id: 2, name: 'B2' }]
    const closeFn = jest.fn()
    const createFn = jest.fn()
    const deleteScenarioFn = jest.fn()
    const saveFn = jest.fn()
    const fetchAndShowBundle = jest.fn()
    const tree = renderer.create(
      <EditScenario
        bundles={mockBundles}
        close={closeFn}
        create={createFn}
        deleteScenario={deleteScenarioFn}
        fetchAndShowBundle={fetchAndShowBundle}
        isEditing={false}
        name='Mock Scenario'
        projectId='P1'
        variants={[]}
        save={saveFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(closeFn).not.toBeCalled()
    expect(createFn).not.toBeCalled()
    expect(deleteScenarioFn).not.toBeCalled()
    expect(saveFn).not.toBeCalled()
    expect(fetchAndShowBundle).toBeCalled()
  })
})
