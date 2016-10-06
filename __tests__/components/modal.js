/* global jest */

import { basicRenderTest } from '../../testUtils/unitUtils'

jest.mock('react-modal', () => 'ReactModal')

import Modal from '../../lib/components/modal'

basicRenderTest({
  component: Modal,
  name: 'Modal',
  notToBeCalledFns: ['onRequestClose'],
  props: {
    onRequestClose: jest.fn()
  }
})
