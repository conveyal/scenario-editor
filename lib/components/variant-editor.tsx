import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/core'
import {faCopy, faTrash, faEye} from '@fortawesome/free-solid-svg-icons'
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
          leftIcon='small-add'
          onClick={() =>
            dispatch(
              createVariant(`${message('variant.name')} ${variants.length + 1}`)
            )
          }
          variantColor='green'
        >
          {message('variant.createAction')}
        </Button>
      </Box>
      <Stack py={2}>
        <Text px={4} py={2}>
          {message('variant.description')}
        </Text>

        <Divider mx={4} />

        <Stack spacing={3} pt={2} pl={4} pr={2} id='scenarios'>
          <Flex pr={2}>
            <Text flex='1' fontWeight='bold'>
              {message('variant.baseline')}
            </Text>
            <Tooltip
              aria-label='Baseline (empty scenario) cannot be modified'
              hasArrow
              label='Baseline (empty scenario) cannot be modified'
              zIndex={1000}
            >
              <Icon name='lock' mr={1} />
            </Tooltip>
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
            icon={faTrash}
            label={message('variant.delete')}
            onClick={onOpen}
            variantColor='red'
          />
        )}
        <IconButton icon={faCopy} label='Copy scenario' onClick={copyVariant} />
        <IconButton
          icon={faEye}
          label={message('variant.showModifications')}
          onClick={showVariant}
        />
      </Stack>
    </Flex>
  )
}
