/* global describe, it, expect, jest */

describe('Component > SelectProject', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const SelectProject = require('../select-project')

  it('renders correctly', () => {
    const createFn = jest.fn()
    const mockProjects = [{ id: 1, name: 'P1' }, { id: 2, name: 'P2' }]
    const pushFn = jest.fn()
    const loadAllProjects = jest.fn()
    const tree = renderer.create(
      <SelectProject
        create={createFn}
        loadAllProjects={loadAllProjects}
        projects={mockProjects}
        push={pushFn}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(createFn).not.toBeCalled()
    expect(pushFn).not.toBeCalled()
    expect(loadAllProjects).toBeCalled()
  })
})
