// @flow

import {handleActions} from 'redux-actions'

import * as user from '../user'

describe('reducers > user', () => {
  const reducer = handleActions(user.reducers, user.initialState)

  // Default State Test
  it('should handle default state', () => {
    expect(reducer(undefined, {type: 'blah', payload: {}})).toMatchSnapshot()
  })

  // Specific Handler Tests
  it('should handle log out', () => {
    const action = {type: 'log out', payload: 'a'}
    expect(reducer(undefined, action)).toMatchSnapshot()
  })

  it('should handle set user', () => {
    const action = {type: 'set user', payload: {idToken: 'mockToken'}}
    expect(reducer(undefined, action)).toMatchSnapshot()
  })
})
