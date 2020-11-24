import {ThemeProvider} from '@chakra-ui/core'
import {expect} from '@jest/globals'
import enzyme from 'enzyme'
import {createRouter} from 'next/router'
import {RouterContext} from 'next/dist/next-server/lib/router-context'
import React from 'react'
import {Map} from 'react-leaflet'
import {Provider} from 'react-redux'

import {makeMockStore, mockStores} from './mock-data'

// Next.js uses Math.random to generate unique ids for pages that get captured in snapshots.
global.Math.random = () => 0.5

const router = createRouter('page', {}, 'as-path', {} as any)

const getName = (c) => c.displayName || c.name

export function testComponent(
  TestComponent,
  props = {},
  initialData = mockStores.init
) {
  const store = makeMockStore(initialData)
  const Wrapping = (props) => (
    <Provider store={store}>
      <ThemeProvider>
        <RouterContext.Provider value={router}>
          {props.children}
        </RouterContext.Provider>
      </ThemeProvider>
    </Provider>
  )

  const mount = () =>
    enzyme.mount(<TestComponent {...props} />, {
      wrappingComponent: Wrapping
    })

  // TODO: Dive down through the `TestComponent` automatically
  const shallow = () =>
    enzyme.shallow(<TestComponent {...props} />, {
      wrappingComponent: Wrapping
    })

  // For debugging purposes (this is not the original component!)
  const name = `WithContext(${getName(TestComponent)})`

  return {mount, name, router, shallow, store}
}

/**
 * Rename to `wrapComponent`. TODO replace all `testComponent`
 */
export const wrapComponent = testComponent

/**
 * Helper function to create quick snapshot tests for components.
 */
export function testAndSnapshot(C, p, id?: any) {
  test(`Component ${getName(C)} snapshot(mount)`, () => {
    const c = testComponent(C, p, id)
    const t = c.mount()
    expect(t).toMatchSnapshot()
    t.unmount()
  })
}

/**
 * Test and snapshot map component
 */
export function wrapMapComponent(C, p, id?: any) {
  const MapWrapper = (props) => (
    <Map>
      <C {...props} />
    </Map>
  )
  MapWrapper.displayName = `WithMap(${getName(C)})`
  return testComponent(MapWrapper, p, id)
}

function snapshotTest(wc, type) {
  test(`Component ${getName(wc)} snapshot(${type})`, () => {
    const s = wc[`${type}`]()
    expect(s).toMatchSnapshot()
    s.unmount()
  })
}

/**
 * Shallow snapshot test.
 */
export function shallowSnapshot(wc) {
  snapshotTest(wc, 'shallow')
}

/**
 * Deep snapshot test.
 */
export function deepSnapshot(wc) {
  snapshotTest(wc, 'mount')
}
