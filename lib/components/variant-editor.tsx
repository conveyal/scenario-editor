import {
  Box,
  Button,
  Divider,
  Flex,
  Stack,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import {memo} from 'react'
import {useDispatch} from 'react-redux'

import {
  copyScenario,
  createVariant,
  deleteVariant,
  editVariantName
} from 'lib/actions/project'
import message from 'lib/message'

import {ConfirmDialog} from './confirm-button'
import Editable from './editable'
import IconButton from './icon-button'
import {CopyIcon, DeleteIcon, LockIcon, ShowIcon} from './icons'
import InnerDock from './inner-dock'
import Tip from './tip'

type VariantProps = {
  showVariant: (index: number) => void
  variants: string[]
}

const isValidName = (s) => s && s.length > 0

export default memo<VariantProps>(function Variants({showVariant, variants}) {
  const dispatch = useDispatch()

  return (
    <>
      <Box p={2}>
        <Button
          isFullWidth
          onClick={() =>
            dispatch(
              createVariant(`${message('variant.name')} ${variants.length + 1}`)
            )
          }
          colorScheme='green'
        >
          {message('variant.createAction')}
        </Button>
      </Box>
      <Stack py={2}>
        <Text px={4} py={2}>
          {message('variant.description')}
        </Text>

        <Divider mx={4} />

        <InnerDock>
          <Stack spacing={3} pt={2} pl={4} pr={2} id='scenarios'>
            <Flex pr={2}>
              <Text flex='1' fontWeight='bold'>
                {message('variant.baseline')}
              </Text>
              <Tip label='Baseline (empty scenario) cannot be modified'>
                <LockIcon />
              </Tip>
            </Flex>
            {variants.map((name, index) => (
              <Box key={index}>
                <Variant
                  copyVariant={() => dispatch(copyScenario(index))}
                  deleteVariant={() => dispatch(deleteVariant(index))}
                  index={index}
                  name={name}
                  onChangeName={(name) =>
                    dispatch(editVariantName({index, name}))
                  }
                  showVariant={() => showVariant(index)}
                />
              </Box>
            ))}
          </Stack>
        </InnerDock>
      </Stack>
    </>
  )
})

function Variant({
  copyVariant,
  deleteVariant,
  index,
  name,
  onChangeName,
  showVariant
}) {
  const {isOpen, onOpen, onClose} = useDisclosure()

  return (
    <Flex align='center'>
      {isOpen && (
        <ConfirmDialog
          action={message('variant.delete')}
          description={message('variant.deleteConfirmation')}
          onClose={onClose}
          onConfirm={deleteVariant}
        />
      )}

      <Text mr={2}>{index + 1}.</Text>
      <Box flex='1' fontWeight='bold'>
        <Editable isValid={isValidName} onChange={onChangeName} value={name} />
      </Box>
      <Stack isInline spacing={0}>
        {index !== 0 && (
          <IconButton
            label={message('variant.delete')}
            onClick={onOpen}
            colorScheme='red'
          >
            <DeleteIcon />
          </IconButton>
        )}
        <IconButton label='Copy scenario' onClick={copyVariant}>
          <CopyIcon />
        </IconButton>
        <IconButton
          label={message('variant.showModifications')}
          onClick={showVariant}
        >
          <ShowIcon />
        </IconButton>
      </Stack>
    </Flex>
  )
}
