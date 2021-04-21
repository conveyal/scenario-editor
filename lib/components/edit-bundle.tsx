import {
  Alert,
  AlertProps,
  AlertTitle,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  StackDivider,
  Text
} from '@chakra-ui/react'
import {useCallback, useState} from 'react'

import {useBundles} from 'lib/hooks/use-collection'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ConfirmButton from './confirm-button'
import {DeleteIcon} from './icons'
import LabelHeading from './label-heading'

const hasContent = (s: string) => s.length > 0

function getSummaryStatus(
  summary: CL.GTFSErrorTypeSummary
): AlertProps['status'] {
  switch (summary.priority) {
    case 'HIGH':
      return 'error'
    case 'MEDIUM':
      return 'warning'
    case 'LOW':
    default:
      return 'info'
  }
}

function DisplayFeed({
  feed,
  index,
  onChange
}: {
  feed: CL.FeedSummary
  index: number
  onChange: (name: string) => void
}) {
  const input = useInput({onChange, test: hasContent, value: feed.name})
  return (
    <Stack spacing={4}>
      <FormControl isInvalid={input.isInvalid}>
        <FormLabel htmlFor={input.id}>
          {`${message('bundle.feed')} #${index + 1}`}
        </FormLabel>
        <Input {...input} placeholder='Feed name' />
      </FormControl>
      {feed.errors?.length > 0 && <Heading size='sm'>Feed errors</Heading>}
      {feed.errors?.map((typeSummary, index) => (
        <Alert key={index} status={getSummaryStatus(typeSummary)}>
          <Stack>
            <AlertTitle>
              {typeSummary.type}
              <Badge ml={2}>{typeSummary.count}</Badge>
            </AlertTitle>

            <Stack divider={<StackDivider />}>
              {typeSummary.someErrors.map((errorSummary, index) => (
                <Stack key={index}>
                  <Flex justify='space-between'>
                    <Stack spacing={0}>
                      <LabelHeading>file</LabelHeading>
                      <Heading size='md'>{errorSummary.file}</Heading>
                    </Stack>
                    {errorSummary.line != null && (
                      <Stack spacing={0}>
                        <LabelHeading>line</LabelHeading>
                        <Heading size='md'>{errorSummary.line}</Heading>
                      </Stack>
                    )}
                    {errorSummary.field != null && (
                      <Stack spacing={0}>
                        <LabelHeading>field</LabelHeading>
                        <Heading size='md'>{errorSummary.field}</Heading>
                      </Stack>
                    )}
                  </Flex>
                  <Text fontFamily='mono'>{errorSummary.message}</Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Alert>
      ))}
    </Stack>
  )
}

function BundleNameInput({name, onChange}) {
  const input = useInput({onChange, test: hasContent, value: name})
  return (
    <FormControl isInvalid={input.isInvalid}>
      <FormLabel htmlFor={input.id}>{message('bundle.name')}</FormLabel>
      <Input {...input} placeholder='Network bundle name' />
    </FormControl>
  )
}

/**
 * Edit bundle is keyed by the bundle ID and will be completely unmounted and
 * recreated when that changes.
 */
export default function EditBundle({
  bundleProjects,
  originalBundle,
  regionId
}: {
  bundleProjects: CL.Project[]
  originalBundle: CL.Bundle
  regionId: string
}) {
  const {remove, update} = useBundles({query: {regionId}})

  const goToBundles = useRouteTo('bundles', {regionId})
  const [bundle, setBundle] = useState(originalBundle)

  const setName = useCallback(
    (name) => setBundle((bundle) => ({...bundle, name})),
    [setBundle]
  )

  // If this bundle has project's associated with it. Disable deletion.
  const totalBundleProjects =
    bundleProjects?.filter((p) => p.bundleId === bundle._id).length ?? 0

  async function _deleteBundle() {
    goToBundles()
    await remove(bundle._id)
  }

  async function _saveBundle() {
    const res = await update(bundle._id, bundle)
    if (res.ok) {
      setBundle(res.data) // nonce update
    }
  }

  function setFeedName(feedId: string, name: string) {
    if (bundle) {
      setBundle({
        ...bundle,
        feeds: bundle.feeds.map((f) => {
          if (f.feedId === feedId) {
            return {...f, name}
          }
          return f
        })
      })
    }
  }

  return (
    <Stack spacing={4}>
      <Heading size='md'>{message('bundle.edit')}</Heading>

      {bundle.status === 'ERROR' && (
        <Alert status='error'>
          {message('bundle.failure')}
          <br />
          {bundle.statusText}
        </Alert>
      )}

      <Box>
        <BundleNameInput name={bundle.name} onChange={setName} />
      </Box>

      {bundle.feeds &&
        bundle.feeds.map((feed, index) => (
          <Box key={feed.feedId}>
            <DisplayFeed
              feed={feed}
              index={index}
              key={feed.feedId}
              onChange={(name: string) => setFeedName(feed.feedId, name)}
            />
          </Box>
        ))}

      <Button
        isDisabled={bundle === originalBundle}
        onClick={_saveBundle}
        size='lg'
        title={message('bundle.save')}
        colorScheme='yellow'
      >
        {message('bundle.save')}
      </Button>

      {totalBundleProjects > 0 ? (
        <Alert status='info'>
          {message('bundle.deleteDisabled', {
            projects: totalBundleProjects
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
