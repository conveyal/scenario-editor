import {createAction} from 'redux-actions'

import {API} from 'lib/constants'

import fetch from './fetch'

// Properties stored locally but not in a profile request on the backend
const createBookmarkLocally = createAction('create bookmark')
const setBookmarks = createAction('set bookmarks')

type Bookmark = {
  name: string
  profileRequest: any
  regionId: string
}

export const createBookmark = (bookmark: Bookmark) =>
  fetch({
    url: `${API.Region}/${bookmark.regionId}/bookmarks`,
    options: {
      body: bookmark,
      method: 'post'
    },
    next: (response) => createBookmarkLocally(response.value)
  })

export const loadBookmarks = (regionId: string) =>
  fetch({
    url: `${API.Region}/${regionId}/bookmarks`,
    next: (res) => setBookmarks(res.value)
  })
