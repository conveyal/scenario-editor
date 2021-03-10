import nock from 'nock'

import {makeMockStore, mockProject} from 'lib/utils/mock-data'

import * as project from '../project'

describe('actions > project', () => {
  it('load should work', () => {
    const scope = nock('http://localhost')
      .get('/api/project/1')
      .reply(200, {_id: '1', bundleId: '1'}, {Content: 'json'})

    const action = project.loadProject('1')
    const store = makeMockStore()

    return store.dispatch(action).then((p) => {
      expect(p._id === '1').toBeTruthy()
      expect(store.getActions()).toHaveLength(3)
      scope.done()
    })
  })

  it('saveToServer should work', () => {
    nock('http://localhost')
      .put('/api/project/1')
      .reply(200, {_id: '1'}, {Content: 'json'})

    const action = project.saveToServer(mockProject)
    const store = makeMockStore()
    return store.dispatch(action).then(() => {
      expect(store.getActions()).toHaveLength(3)
    })
  })

  it('set should work', () => {
    expect(project.set()).toMatchSnapshot()
  })

  it('setAll should work', () => {
    expect(project.setAll()).toMatchSnapshot()
  })
})
