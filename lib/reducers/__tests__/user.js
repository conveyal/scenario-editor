// @flow

import {handleActions} from 'redux-actions'

import * as user from '../user'

describe('reducers > user', () => {
  const reducer = handleActions(user.reducers, user.initialState)

  // Default State Test
  it('should handle default state', () => {
    expect(reducer(undefined, {type: 'blah', payload: {}})).toMatchSnapshot()
  })

  it('should handle set user', () => {
    const action = {type: 'set user', payload: {idToken: 'mockToken'}}
    expect(reducer(undefined, action)).toMatchSnapshot()
  })
})
