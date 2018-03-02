// @flow
import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import sortBy from 'lodash/sortBy'
import React from 'react'
import Select from 'react-select'

import {Group} from '../input'
import {Button} from '../buttons'
import messages from '../../utils/messages'

import type {Bookmark} from '../../types'

type Props = {
  bookmarks: Bookmark[],
  bookmarkData: any,
  disabled: boolean,
  selectedBookmark: boolean,

  createBookmark: (any) => void,
  selectBookmark: (Bookmark) => void
}

export default class BookmarkChooser extends Pure {
  props: Props

  _selectBookmark = (e: {value: string}) => {
    const {bookmarks, selectBookmark} = this.props

    const bookmark = bookmarks.find(b => b._id === e.value)
    if (bookmark) selectBookmark(bookmark)
  }

  _createBookmark = () => {
    const {bookmarkData, bookmarks, createBookmark} = this.props
    const bookmarkName = window.prompt(
      'Enter a name for your bookmark',
      `Bookmark ${bookmarks.length + 1}`
    )

    if (bookmarkName && bookmarkName.length > 0) {
      createBookmark({
        ...bookmarkData,
        name: bookmarkName
      })
    }
  }

  render () {
    const {bookmarks, disabled, selectedBookmark} = this.props

    const options = sortBy(bookmarks, ['name']).map(b => ({
      label: b.name,
      value: b._id
    }))

    return (
      <Group label={messages.analysis.bookmark}>
        <div className='row'>
          <div className='col-xs-6'>
            <Select
              clearable={false}
              options={options}
              disabled={disabled} // don't allow users to reselect bookmarks while their bookmark is loading
              value={selectedBookmark}
              onChange={this._selectBookmark}
            />
          </div>
          <div className='col-xs-6'>
            <Button
              block
              disabled={disabled}
              onClick={this._createBookmark}
              style='success'
            >
              <Icon type='plus' /> {messages.analysis.createBookmark}
            </Button>
          </div>
        </div>
      </Group>
    )
  }
}
