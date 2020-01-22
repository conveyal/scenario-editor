import nock from 'nock'

import {makeMockStore} from 'lib/utils/mock-data'

import fetch from '../fetch'

const testURL = 'http://localhost'

test('fetch-action - json response', () => {
  const jsonResponse = {id: 2}
  nock(testURL)
    .get('/')
    .reply(200, jsonResponse, {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(fetch({url: '/'})).then(r => {
    expect(r).toEqual(jsonResponse)
  })
})

test('fetch-action - text response', () => {
  const textResponse = 'Hello World'
  nock(testURL)
    .get('/')
    .reply(200, textResponse, {Content: 'text'})

  const store = makeMockStore()
  return store.dispatch(fetch({url: '/'})).then(r => {
    expect(r).toEqual(textResponse)
  })
})
