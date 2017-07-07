/* global describe, it, expect, jest */

describe('Component > Project', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const Project = require('../project')

  it('renders correctly', () => {
    const loadR5Versions = jest.fn()
    const tree = renderer.create(
      <Project
        description='A test project'
        id='1234'
        isLoaded={false}
        loadR5Versions={loadR5Versions}
        name='Test'
        >
        Project content
      </Project>
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(loadR5Versions).toBeCalled()
  })

  it('renders unsupported message correctly', () => {
    const loadR5Versions = jest.fn()
    const tree = renderer.create(
      <Project
        description='A test project'
        id='1234'
        isLoaded={false}
        loadR5Versions={loadR5Versions}
        name='Test'
        r5VersionUnsupported
        >
        Project content
      </Project>
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(loadR5Versions).toBeCalled()
  })
})
