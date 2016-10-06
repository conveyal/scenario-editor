/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('react-modal', () => 'ReactModal')

import Modal from '../../lib/components/modal'

const onRequestCloseFn = jest.fn()

basicRenderTest({
  component: Modal,
  name: 'Modal',
  notToBeCalledFns: [onRequestCloseFn],
  props: {
    onRequestClose: onRequestCloseFn
  }
})
