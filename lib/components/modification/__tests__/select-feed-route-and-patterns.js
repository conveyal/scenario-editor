/* global describe, it, expect, jest */

describe('Component > SelectFeedRouteAndPatterns', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const SelectFeedRouteAndPatterns = require('../select-feed-route-and-patterns')

  it('renders correctly', () => {
    const onChangeFn = jest.fn()
    const tree = renderer.create(
      <SelectFeedRouteAndPatterns
        feeds={[]}
        onChange={onChangeFn}
        routes={[]}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(onChangeFn).not.toBeCalled()
  })
})
