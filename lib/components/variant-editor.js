// @flow
import Icon from '@conveyal/woonerf/components/icon'
import memoize from 'lodash/memoize'
import React, {Component} from 'react'

import messages from '../utils/messages'

type Props = {
  createVariant: (name: string) => void,
  deleteVariant: (index: number) => void,
  editVariantName: ({index: number, name: string}) => void,
  showVariant: number => void,
  variants: string[]
}

export default class Variants extends Component<void, Props, void> {
  _create = () => {
    const {createVariant, variants} = this.props
    const variantName = window.prompt(
      `${messages.variant.enterName}`,
      `${messages.variant.name} ${variants.length + 1}`
    )
    if (variantName) createVariant(variantName)
  }

  _deleteVariant = memoize((index: number) => () => {
    const {deleteVariant} = this.props
    if (
      window.confirm(
        `${messages.variant.deleteConfirmation}`
      )
    ) {
      deleteVariant(index)
    }
  })

  _editVariantName = memoize((index: number) => () => {
    const {editVariantName, variants} = this.props
    const variantName = variants[index]
    const newVariantName = window.prompt(
      `${messages.variant.enterName}`,
      variantName
    )
    if (newVariantName) editVariantName({index, name: newVariantName})
  })

  _showVariant = memoize((index: number) => () => {
    this.props.showVariant(index)
  })

  render () {
    const {variants} = this.props
    return (
      <div>
        <div className='DockTitle'>
          <Icon type='clone' /> {messages.variant.plural}
          <a
            className='pull-right'
            onClick={this._create}
            tabIndex={0}
            title={messages.variant.createAction}
          >
            <Icon type='plus' /> Create
          </a>
        </div>
        <div className='Variants'>
          <ol>
            {variants.map((name, index) => (
              <div className='Variant' key={`variant-${index}`}>
                <li> {name}
                  <a
                    className='pull-right'
                    onClick={this._showVariant(index)}
                    tabIndex={0}
                    title={messages.variant.showModifications}
                  >
                    <Icon type='eye' />
                  </a>
                  <a
                    className='pull-right'
                    onClick={this._editVariantName(index)}
                    tabIndex={0}
                    title={messages.variant.editName}
                  >
                    <Icon type='pencil' />
                  </a>
                  {index !== 0 &&
                    <a
                      className='pull-right'
                      onClick={this._deleteVariant(index)}
                      tabIndex={0}
                      title={messages.variant.delete}
                    >
                      <Icon type='trash' />
                    </a>}
                </li>
              </div>
            ))}
          </ol>
        </div>
      </div>
    )
  }
}
