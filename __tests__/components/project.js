/* global describe, it, expect, jest */

import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('../../lib/components/icon', () => 'Icon')

import Project from '../../lib/components/project'

describe('Project', () => {
  it('renders correctly', () => {
    const loadFn = jest.fn()
    const tree = renderer.create(
      <Project
        description='A test project'
        id='1234'
        load={loadFn}
        name='Test'
        >
        Project content
      </Project>
    ).toJSON()
    expect(tree).toMatchSnapshot()
    expect(loadFn).toBeCalled
  })
})
