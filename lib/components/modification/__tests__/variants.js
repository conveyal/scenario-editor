import enzyme from 'enzyme'
import React from 'react'

import Variants from '../variants'

test('Components > Modification > Variants', () => {
  const variants = ['a', 'b']
  const setVariant = jest.fn()
  const wrapper = enzyme.shallow(
    <Variants
      allVariants={variants}
      activeVariants={[true, false]}
      modificationId='1'
      setVariant={setVariant}
    />
  )
  expect(wrapper).toMatchSnapshot()
  // Toggle a variant
  const checkBox = wrapper.find({name: 'b'})
  checkBox.simulate('change', {target: {checked: true}})
  expect(setVariant.mock.calls[0][0]).toBe(1)
  expect(setVariant.mock.calls[0][1]).toBe(true)
})
