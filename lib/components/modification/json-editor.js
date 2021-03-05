import {Button, Stack, Textarea, Text} from '@chakra-ui/react'
import omit from 'lodash/omit'
import React from 'react'

import message from 'lib/message'

const omitAttributes = (m) =>
  omit(m, [
    '_id',
    'accessGroup',
    'createdAt',
    'createdBy',
    'nonce',
    'projectId',
    'type',
    'updatedAt',
    'updatedBy'
  ])

export default function JSONEditor(props) {
  const textAreaRef = React.useRef(null)
  const attributes = React.useMemo(
    () => JSON.stringify(omitAttributes(props.modification), null, '  '),
    [props.modification]
  )
  const save = React.useCallback(() => {
    try {
      const json = JSON.parse(textAreaRef.current.value)
      props.save(json)
    } catch (e) {
      window.alert('Error editing cutom JSON. See console for details.')
      console.error(e)
    }
  }, [props])

  return (
    <Stack spacing={4}>
      <Text>{message('modification.customizeDescription')}</Text>
      <Textarea
        defaultValue={attributes}
        fontFamily='mono'
        fontSize='sm'
        height='40em'
        key={attributes}
        ref={textAreaRef}
      />

      <Button isFullWidth onClick={save} colorScheme='green'>
        {message('modification.saveCustomized')}
      </Button>
    </Stack>
  )
}
