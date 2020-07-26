import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormControlProps
} from '@chakra-ui/core'
import get from 'lodash/fp/get'
import isEqual from 'lodash/isEqual'
import {memo, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  setMaxTripDurationMinutes,
  setTravelTimePercentile
} from 'lib/actions/analysis'
import {createBookmark} from 'lib/actions/bookmark'
import message from 'lib/message'
import selectBookmarks from 'lib/selectors/bookmarks'
import selectCurrentRegionId from 'lib/selectors/current-region-id'

import Select from '../select'

// Number precision
const isWithinTolerance = (n1, n2) => Math.abs(n1 - n2) < 1e-6

// Select `get`s
const getId = get('_id')
const getOptionLabel = get('name')

/**
 * Bookmarks contain many more parameters than we use in the UI. Only check the ones from there.
 */
function findBookmark(settings, bookmarks) {
  const keys = Object.keys(settings || {})
  return bookmarks.find(
    ({profileRequest}) =>
      keys.find((k) => {
        if (typeof profileRequest[k] === 'number') {
          return !isWithinTolerance(profileRequest[k], settings[k])
        }
        return !isEqual(profileRequest[k], settings[k])
      }) == null
  )
}

type Props = {
  disabled: boolean
  isComparison?: boolean
  onChange: (any) => void
  requestSettings: any
}

export default memo<Props & FormControlProps>(function BookmarkChooser({
  disabled,
  isComparison = false,
  onChange,
  requestSettings,
  ...p
}) {
  const dispatch = useDispatch()
  const bookmarks = useSelector(selectBookmarks)
  const regionId = useSelector(selectCurrentRegionId)
  const [bookmark, setBookmark] = useState(() =>
    findBookmark(requestSettings, bookmarks)
  )
  const id = 'select-bookmark-' + isComparison

  // Check the bookmarks to see if they match any settings
  useEffect(() => {
    setBookmark(findBookmark(requestSettings, bookmarks))
  }, [bookmarks, requestSettings, setBookmark])

  function _selectBookmark(e) {
    const bookmark = bookmarks.find((b) => b._id === e._id)
    if (bookmark) {
      const settings = bookmark.profileRequest
      onChange(settings)
      dispatch(setMaxTripDurationMinutes(settings.maxTripDurationMinutes))

      if (settings.travelTimePercentile) {
        dispatch(setTravelTimePercentile(settings.travelTimePercentile))
      }
    }
  }

  function _createBookmark() {
    const bookmarkName = window.prompt(
      'Enter a name for your bookmark',
      `Bookmark ${bookmarks.length + 1}`
    )

    if (bookmarkName && bookmarkName.length > 0) {
      dispatch(
        createBookmark({
          name: bookmarkName,
          profileRequest: requestSettings,
          regionId
        })
      )
    }
  }

  return (
    <FormControl isDisabled={disabled} {...p}>
      <Flex justify='space-between'>
        <FormLabel htmlFor={id}>{message('analysis.bookmark')}</FormLabel>
        <Button
          isDisabled={disabled}
          onClick={_createBookmark}
          rightIcon='small-add'
          size='xs'
          variantColor='green'
        >
          New
        </Button>
      </Flex>
      <Box>
        <Select
          name={id}
          inputId={id}
          isDisabled={disabled}
          key={getId(bookmark)}
          getOptionLabel={getOptionLabel}
          getOptionValue={getId}
          options={bookmarks}
          onChange={_selectBookmark}
          value={bookmark}
        />
      </Box>
    </FormControl>
  )
})
