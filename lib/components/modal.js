// @flow
import React from 'react'
import Modal from 'react-modal'
import type {Children} from 'react'

type Props = {
  children?: Children,
  contentLabel?: string,
  onRequestClose?: Event => void
}

export default ({children, contentLabel = 'Modal', onRequestClose}: Props) => (
  <Modal
    className={{base: 'CustomModal'}}
    contentLabel={contentLabel}
    isOpen
    onRequestClose={onRequestClose}
    shouldCloseOnOverlayClick
    style={{overlay: {zIndex: 2500}}}
  >
    {children}
  </Modal>
)

export const ModalBody = (props: {children?: Children}) => (
  <div className='CustomModal-block'>{props.children}</div>
)

export const ModalTitle = (props: {children?: Children}) => (
  <div className='CustomModal-title'>{props.children}</div>
)
