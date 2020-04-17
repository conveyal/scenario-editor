import nock from 'nock'

import {makeMockStore, mockRegion} from 'lib/utils/mock-data'

import * as region from '../region'

test('region.create', () => {
  nock('http://localhost')
    .post('/api/region')
    .reply(200, mockRegion, {Content: 'json'})

  nock('http://localhost')
    .get('/api/region/1')
    .reply(200, mockRegion, {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(region.create(mockRegion)).then(r => {
    expect(store.getActions()).toHaveLength(2)
    expect(r).toEqual(mockRegion)
  })
})

test('region.deleteRegion', () => {
  nock('http://localhost')
    .delete('/api/region/1')
    .reply(204)

  const store = makeMockStore()
  return store.dispatch(region.deleteRegion('1')).then(() => {
    expect(store.getActions()).toHaveLength(3)
  })
})

test('region.loadRegion', () => {
  nock('http://localhost')
    .get('/api/region/1')
    .reply(200, mockRegion, {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(region.loadRegion('1')).then(r => {
    expect(r).toEqual(mockRegion)
  })
})

test('region.load', () => {
  nock('http://localhost')
    .get('/api/region/1')
    .reply(200, mockRegion, {Content: 'json'})

  nock('http://localhost')
    .get('/api/bundle')
    .query(true)
    .reply(200, [], {Content: 'json'})

  nock('http://localhost')
    .get('/api/project')
    .query(true)
    .reply(200, [], {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(region.load('1')).then(r => {
    expect(r.region).toEqual(mockRegion)
    expect(r.bundles).toHaveLength(0)
    expect(r.projects).toHaveLength(0)
    expect(store.getActions()).toHaveLength(11)
  })
})

test('region.loadAll', () => {
  nock('http://localhost')
    .get('/api/region')
    .reply(200, [], {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(region.loadAll()).then(r => {
    expect(store.getActions()).toHaveLength(3)
    expect(r).toHaveLength(0)
  })
})

test('region.save', async () => {
  nock('http://localhost')
    .put('/api/region/1')
    .reply(200, mockRegion, {Content: 'json'})

  const store = makeMockStore()
  return store.dispatch(region.save(mockRegion)).then(r => {
    expect(r).toEqual(mockRegion)
    expect(store.getActions()).toHaveLength(2)
  })
})
