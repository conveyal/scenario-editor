/* global describe, expect, it */

describe('Container > Application', () => {
  const nock = require('nock')
  const React = require('react')
  const {Provider} = require('react-redux')
  const renderer = require('react-test-renderer')
  const {makeMockStore, mockStores} = require('../../utils/mock-data')

  it('renders correctly', () => {
    const Application = require('../application')
    const mockStore = makeMockStore(mockStores.init)

    // ensure that /api/project is called during first load
    nock('http://mockHost.com/')
      .get('/api/project')
      .reply(200, {})

    const props = {
      // react-router params
      location: {
        pathname: '/'
      },
      params: {}
    }

    // mount component
    const component = renderer.create(
      <Provider store={mockStore}>
        <Application
          {...props}
          />
      </Provider>
    )
    // when trying to make a snapshot from mountToJson, I got an out of memory error

    const tree = component.toJSON()
    // assert that application was rendered
    expect(tree).toMatchSnapshot()
  })
})
