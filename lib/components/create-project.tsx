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
import {useDispatch} from 'react-redux'

import {create} from 'lib/actions/project'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import LogRocket from 'lib/logrocket'
import message from 'lib/message'

import ControlledSelect from './controlled-select'
import InnerDock from './inner-dock'
import Link from './link'

const hasText = (s) => s && s.length > 0
const getName = fpGet('name')
const getId = fpGet('_id')

export function CreateProject({bundles, dispatch, query}) {
  const [bundleId, setBundleId] = useState(null)
  const [creating, setCreating] = useState(false)
  const nameInput = useInput({test: hasText, value: ''})
  const routeToModifications = useRouteTo('modifications')
  const {regionId} = query

  const readyToCreate = !nameInput.isInvalid && bundleId && bundleId.length > 0

  async function _create() {
    setCreating(true)
    try {
      const project = await dispatch(
        create({
          bundleId,
          name: nameInput.value,
          regionId
        })
      )
      routeToModifications({
        regionId: project.regionId,
        projectId: project._id
      })
    } catch (e) {
      LogRocket.captureException(e)
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

export default function ConnectedCreateProject(p: {
  bundles: CL.Bundle[]
  query: Record<string, string>
}) {
  const dispatch = useDispatch()
  return <CreateProject {...p} dispatch={dispatch} />
}
