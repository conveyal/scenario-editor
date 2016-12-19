/* global describe, it, expect, jest */

describe('Component > SelectPatterns', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const SelectPatterns = require('../select-patterns')

  it('renders correctly', () => {
    const onChangeFn = jest.fn()
    const routePatterns = [
      {
        pattern_id: 1,
        name: 'mock pattern',
        trips: []
      }
    ]
    const tree = renderer.create(
      <SelectPatterns
        onChange={onChangeFn}
        routePatterns={routePatterns}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
