import {Button, Stack, Textarea, Text} from '@chakra-ui/react'
import omit from 'lodash/omit'
import React from 'react'

import message from 'lib/message'
import InnerDock from 'lib/components/inner-dock'
import {SaveIcon, UndoIcon} from 'lib/components/icons'
import TipButton from 'lib/components/tip-button'

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

  function undo() {
    textAreaRef.current.value = JSON.stringify(
      omitAttributes(props.modification),
      null,
      '  '
    )
  }

  return (
    <>
      <Stack isInline spacing={0}>
        <Button
          isFullWidth
          leftIcon={<SaveIcon />}
          onClick={save}
          colorScheme='green'
          rounded={0}
        >
          {message('modification.saveCustomized')}
        </Button>
        <TipButton
          colorScheme='blue'
          label='Undo changes'
          onClick={undo}
          rounded={0}
        >
          <UndoIcon />
        </TipButton>
      </Stack>
      <InnerDock>
        <Stack p={4} spacing={4}>
          <Text>{message('modification.customizeDescription')}</Text>
          <Textarea
            defaultValue={attributes}
            fontFamily='mono'
            fontSize='sm'
            height='40em'
            key={attributes}
            ref={textAreaRef}
            spellCheck='false'
          />
        </Stack>
      </InnerDock>
    </>
  )
}
