/* global describe, it, expect, jest */

describe('Component > SelectStops', () => {
  const renderer = require('react-test-renderer')
  const React = require('react')
  const SelectStops = require('../select-stops')

  it('renders correctly with no feed data', () => {
    const update = jest.fn()
    const setMapStateFn = jest.fn()
    const tree = renderer.create(
      <SelectStops
        feed={{}}
        modification={{}}
        setMapState={setMapStateFn}
        update={update}
        />
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(update).not.toBeCalled()
    expect(setMapStateFn).not.toBeCalled()
  })
})
