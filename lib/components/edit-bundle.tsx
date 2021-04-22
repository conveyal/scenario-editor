import {
  Alert,
  AlertProps,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  StackDivider,
  Text,
  Collapse,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react'
import startCase from 'lodash/startCase'
import {useCallback, useState} from 'react'

import {useBundles} from 'lib/hooks/use-collection'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

import ConfirmButton from './confirm-button'
import {ChevronDown, ChevronUp, DeleteIcon} from './icons'
import LabelHeading from './label-heading'
import IconButton from './icon-button'

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

function formatType(errorType: string) {
  return startCase(errorType.replace('Error', ''))
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
  const errors = feed.errors ?? []
  const {isOpen, onToggle} = useDisclosure({defaultIsOpen: true})
  const input = useInput({onChange, test: hasContent, value: feed.name})
  const badgeBg = useColorModeValue('gray.900', 'white')
  const badgeColor = useColorModeValue('white', 'gray.900')
  return (
    <Stack spacing={4}>
      <FormControl isInvalid={input.isInvalid}>
        <FormLabel htmlFor={input.id}>
          {`${message('bundle.feed')} #${index + 1}`}
        </FormLabel>
        <Input {...input} placeholder='Feed name' />
      </FormControl>
      {errors.length > 0 && (
        <Stack spacing={2}>
          <Flex justify='space-between'>
            <Heading size='md'>Feed errors</Heading>
            <IconButton
              onClick={onToggle}
              label={isOpen ? 'Hide errors' : 'Show errors'}
            >
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </IconButton>
          </Flex>
          <Text>
            Errors, warnings, and notices generated while processing this feed.
          </Text>
          <Collapse in={isOpen}>
            {errors.map((typeSummary, index) => (
              <Alert
                alignItems='flex-start'
                key={index}
                flexDir='column'
                status={getSummaryStatus(typeSummary)}
              >
                <Flex mb={1}>
                  <Heading size='md'>{formatType(typeSummary.type)}</Heading>
                  <Text
                    bg={badgeBg}
                    color={badgeColor}
                    display='inline-block'
                    fontSize='0.8em'
                    fontWeight='bold'
                    opacity={0.7}
                    px={2}
                    py={1}
                    ml={3}
                    rounded='md'
                  >
                    {typeSummary.count}
                  </Text>
                </Flex>

                <Stack divider={<StackDivider />} width='100%'>
                  {typeSummary.someErrors.map((errorSummary, index) => (
                    <Stack key={index}>
                      <Flex justify='space-between'>
                        <Stack spacing={0}>
                          <LabelHeading>file</LabelHeading>
                          <Heading size='md'>{errorSummary.file}.txt</Heading>
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
                      <Stack spacing={0}>
                        <LabelHeading>message</LabelHeading>
                        <Heading size='md'>{errorSummary.message}</Heading>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Alert>
            ))}
          </Collapse>
        </Stack>
      )}
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
      <Heading size='lg'>{message('bundle.edit')}</Heading>

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
