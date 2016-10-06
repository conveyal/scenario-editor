/* globals describe, expect, it */

import React from 'react'
import renderer from 'react-test-renderer'

/**
 * Performs a basic render test of a Component
 *
 * @param  {Mixed} components Can be either an array of objects or a single object
 *   Each object can have the following properties:
 *   - children: Any children to render within the component
 *   - component (required): The component to render
 *   - name: How to classify the test in the `describe section`
 *   - notToBeCalledFns: An array of String keys that map to property values that are jest.fn()'s that will be asserted as not called during basic render test
 *   - props (required): The props of the component to render
 *   - toBeCalledFns: Same as `notToBeCalledFns` except they are asserted to be called
 */
export function basicRenderTest (components) {
  // prepare components to be tested
  if (!Array.isArray(components)) {
    components = [components]
  }

  // run tests on each component
  components.forEach((component) => {
    const Component = component.component

    if (typeof component.name !== 'string') {
      throw new Error('Component name not provided in basicRenderTest cfg')
    }

    describe(`Component > ${component.name}`, () => {
      it('renders correctly', () => {
        const tree = renderer.create(
          <Component
            {...component.props}
            >
            {component.children}
          </Component>
        ).toJSON()
        expect(tree).toMatchSnapshot()

        if (Array.isArray(component.toBeCalledFns)) {
          component.toBeCalledFns.forEach((fn) => {
            expect(component.props[fn]).toBeCalled()
          })
        }

        if (Array.isArray(component.notToBeCalledFns)) {
          component.notToBeCalledFns.forEach((fn) => {
            expect(component.props[fn]).not.toBeCalled()
          })
        }
      })
    })
  })
}

/**
 * Creates a object to mock a module with multiple exports
 *
 * @param  {Array} components An array of Strings representing the named exports
 * @return {Object}           A mock representation of the named exports
 */
export function mockExports (components) {
  if (Array.isArray(components)) {
    const mockedComponents = {}
    for (let i = 0; i < components.length; i++) {
      const name = components[i]
      mockedComponents[name] = name
    }
    return mockedComponents
  }
}
