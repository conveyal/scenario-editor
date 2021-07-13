import {
  Alert,
  AlertDescription,
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

function filterInvalidBundles(bundles: CL.Bundle[]): CL.Bundle[] {
  return bundles.filter((b) => {
    return (
      b.status === 'DONE' &&
      b.feeds?.every(
        (f) =>
          // Before 20201-05 bundle feeds have no errors.
          !Array.isArray(f.errors) ||
          f.errors.every((e) => e.priority !== 'HIGH')
      )
    )
  })
}

function countErrors(bundle?: CL.Bundle) {
  const errors = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    UKNOWN: 0,
    total: 0
  }
  if (bundle?.feeds?.length > 0) {
    bundle.feeds.forEach((feed) => {
      feed.errors?.forEach((e) => {
        errors[e.priority]++
        errors.total++
      })
    })
  }
  return errors
}

function getStatusFromErrors(errors) {
  if (errors.HIGH > 0) return 'error'
  if (errors.MEDIUM > 0) return 'warning'
  if (errors.LOW > 0) return 'info'
}

export default function CreateProject({
  bundles,
  query
}: {
  bundles: CL.Bundle[]
  query: CL.Query
}) {
  const [bundleId, setBundleId] = useState(query.bundleId)
  const [creating, setCreating] = useState(false)
  const nameInput = useInput({test: hasText, value: ''})
  const {regionId} = query
  const routeToModifications = useRouteTo('modifications', {regionId})
  const readyToCreate = !nameInput.isInvalid && bundleId && bundleId.length > 0
  const selectedBundle = bundles.find((b) => b._id === bundleId)
  const errors = countErrors(selectedBundle)
  const bundleStatus = getStatusFromErrors(errors)

  async function _create() {
    setCreating(true)
    const response = await postJSON<CL.Project>(`/api/db/projects`, {
      bundleId,
      name: nameInput.value,
      regionId
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
          <Input autoFocus {...nameInput} />
        </FormControl>

        {bundles.length > 0 ? (
          <ControlledSelect
            label={message('project.bundle')}
            getOptionLabel={getName}
            getOptionValue={getId}
            options={filterInvalidBundles(bundles)}
            onChange={(b) => setBundleId(b._id)}
            placeholder={message('project.selectBundle')}
            value={selectedBundle}
          />
        ) : (
          <Stack spacing={4}>
            <Box>{message('project.noBundles')}</Box>
            <Link to='bundleCreate' query={query}>
              <Button colorScheme='green'>{message('bundle.create')}</Button>
            </Link>
          </Stack>
        )}
        {errors.total > 0 && (
          <Alert status={bundleStatus}>
            <AlertIcon />
            <AlertDescription>
              <strong>{errors.total}</strong> issues found while processing this
              bundle.{' '}
              <Link to='bundle' query={{bundleId, regionId}}>
                View issues &rarr;
              </Link>
            </AlertDescription>
          </Alert>
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
