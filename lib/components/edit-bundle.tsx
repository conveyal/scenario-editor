import {
  Alert,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack
} from '@chakra-ui/react'
import {useCallback, useState} from 'react'
import {useDispatch} from 'react-redux'
import {cache} from 'swr'

import {deleteBundle, saveBundle} from 'lib/actions'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ConfirmButton from './confirm-button'
import {DeleteIcon} from './icons'

const hasContent = (s) => s.length > 0

function FeedNameInput({feed, index, onChange, ...p}) {
  const input = useInput({onChange, test: hasContent, value: feed.name})
  return (
    <FormControl {...p} isInvalid={input.isInvalid}>
      <FormLabel htmlFor={input.id}>
        {`${message('bundle.feed')} #${index + 1}`}
      </FormLabel>
      <Input {...input} placeholder='Feed name' />
    </FormControl>
  )
}

function BundleNameInput({name, onChange, ...p}) {
  const input = useInput({onChange, test: hasContent, value: name})
  return (
    <FormControl {...p} isInvalid={input.isInvalid}>
      <FormLabel htmlFor={input.id}>{message('bundle.name')}</FormLabel>
      <Input {...input} placeholder='Network bundle name' />
    </FormControl>
  )
}

type EditBundleProps = {
  bundleProjects: CL.Project[]
  bundle: CL.Bundle
  query: Record<string, string>
}

/**
 * Edit bundle is keyed by the bundle ID and will be completely unmounted and
 * recreated when that changes.
 */
export default function EditBundle({
  bundleProjects,
  bundle,
  query
}: EditBundleProps) {
  const dispatch = useDispatch<any>()

  const {regionId} = query
  const goToBundles = useRouteTo('bundles', {regionId})
  const [editedBundle, setEditedBundle] = useState(bundle)

  const setName = useCallback(
    (name) => setEditedBundle((bundle) => ({...bundle, name})),
    [setEditedBundle]
  )

  // If this bundle has project's associated with it. Disable deletion.
  const disableDelete = bundleProjects.length > 0

  async function _deleteBundle() {
    await dispatch(deleteBundle(bundle._id))
    cache.clear()
    goToBundles()
  }

  async function _saveBundle() {
    const b = await dispatch(saveBundle(editedBundle))
    setEditedBundle(b) // nonce update
  }

  function setFeedName(feedId: string, name: string) {
    setEditedBundle({
      ...editedBundle,
      feeds: editedBundle.feeds.map((f) => {
        if (f.feedId === feedId) {
          return {...f, name}
        }
        return f
      })
    })
  }

  return (
    <Stack spacing={4}>
      <Heading size='md'>{message('bundle.edit')}</Heading>

      {editedBundle.status === 'PROCESSING_GTFS' && (
        <Alert status='info'>{message('bundle.processing')}</Alert>
      )}

      {editedBundle.status === 'ERROR' && (
        <Alert status='error'>
          {message('bundle.failure')}
          <br />
          {editedBundle.statusText}
        </Alert>
      )}

      <BundleNameInput name={editedBundle.name} onChange={setName} />

      {editedBundle.feeds &&
        editedBundle.feeds.map((feed, index) => (
          <FeedNameInput
            feed={feed}
            index={index}
            key={feed.feedId}
            onChange={(name: string) => setFeedName(feed.feedId, name)}
          />
        ))}

      <Button
        isDisabled={editedBundle === bundle}
        onClick={_saveBundle}
        size='lg'
        title={message('bundle.save')}
        colorScheme='yellow'
      >
        {message('bundle.save')}
      </Button>

      {disableDelete ? (
        <Alert status='info'>
          {message('bundle.deleteDisabled', {
            projects: bundleProjects.length
          })}
        </Alert>
      ) : (
        <ConfirmButton
          description={message('bundle.deleteConfirmation')}
          leftIcon={<DeleteIcon />}
          onConfirm={_deleteBundle}
          size='lg'
          colorScheme='red'
        >
          {message('bundle.delete')}
        </ConfirmButton>
      )}
    </Stack>
  )
}
