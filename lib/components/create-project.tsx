import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import {useState} from 'react'

import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {postJSON} from 'lib/utils/safe-fetch'

import ControlledSelect from './controlled-select'
import InnerDock from './inner-dock'
import Link from './link'

const hasText = (s) => s && s.length > 0
const getName = fpGet('name')
const getId = fpGet('_id')

export default function CreateProject({bundles, query}) {
  const [bundleId, setBundleId] = useState(null)
  const [creating, setCreating] = useState(false)
  const nameInput = useInput({test: hasText, value: ''})
  const {regionId} = query
  const routeToModifications = useRouteTo('modifications', {regionId})

  const readyToCreate = !nameInput.isInvalid && bundleId && bundleId.length > 0

  async function _create() {
    setCreating(true)
    const response = await postJSON(`/api/db/projects`, {
      bundleId,
      name: nameInput.value,
      regionId,
      variants: ['Default']
    })

    if (response.ok) {
      routeToModifications({projectId: response.data._id})
    } else if (response.ok === false) {
      setCreating(false)
    }
  }

  return (
    <InnerDock>
      <Stack p={4} spacing={4}>
        <Heading size='md'>{message('project.createAction')}</Heading>
        <FormControl isRequired isInvalid={nameInput.isInvalid}>
          <FormLabel htmlFor={nameInput.id}>
            {message('project.name')}
          </FormLabel>
          <Input {...nameInput} />
        </FormControl>

        {bundles.length > 0 ? (
          <ControlledSelect
            label={message('project.bundle')}
            getOptionLabel={getName}
            getOptionValue={getId}
            options={bundles.filter((b) => b.status === 'DONE')}
            onChange={(b) => setBundleId(b._id)}
            placeholder={message('project.selectBundle')}
            value={bundles.find((b) => b._id === bundleId)}
          />
        ) : (
          <Stack spacing={4}>
            <Box>{message('project.noBundles')}</Box>
            <Link to='bundleCreate' {...query}>
              <Button colorScheme='green'>{message('bundle.create')}</Button>
            </Link>
          </Stack>
        )}
        {!readyToCreate && (
          <Alert status='warning'>
            <AlertIcon /> {message('project.createActionTooltip')}
          </Alert>
        )}
        <Button
          isLoading={creating}
          isDisabled={!readyToCreate || creating}
          onClick={_create}
          colorScheme='green'
        >
          {message('common.create')}
        </Button>
      </Stack>
    </InnerDock>
  )
}
