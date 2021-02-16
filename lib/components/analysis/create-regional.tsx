import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  FormHelperText,
  Stack,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/core'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import sort from 'lodash/sortBy'
import {useRouter} from 'next/router'
import {useCallback, useState} from 'react'
import {useSelector} from 'react-redux'

import {API} from 'lib/constants'
import useInput from 'lib/hooks/use-controlled-input'
import message from 'lib/message'
import {
  activeOpportunityDataset,
  opportunityDatasets as selectOpportunityDatasets
} from 'lib/modules/opportunity-datasets/selectors'
import {versionToNumber} from 'lib/modules/r5-version/utils'
import {routeTo} from 'lib/router'
import selectCurrentRegionId from 'lib/selectors/current-region-id'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'
import {safeFetch} from 'lib/utils/safe-fetch'
import {getUser} from 'lib/user'

import Select from '../select'

// For react-select options
const getId = fpGet('_id')

// Combine the source name with the name
const getFullODName = (od) => `${od.sourceName}: ${od.name}`

const testContent = (s) => s && s.length > 0

const defaultCutoffs = [20, 30, 45, 60]
const defaultPercentiles = [5, 25, 50, 75, 95]

const parseStringAsIntArray = (s) =>
  Array.isArray(s) ? s : sort((s || '').split(',').map((s) => Number(s)))

const createTestArray = (min, max) => (sorted) =>
  sorted.every((s) => Number.isInteger(s)) &&
  sorted[0] >= min &&
  sorted[sorted.length - 1] <= max

const onlyDigits = (s) => /^\d+$/.test(s)
const testCutoffs = createTestArray(5, 120)
const testPercentiles = createTestArray(1, 99)
const testCutoff = (c, o) => onlyDigits(o) && c >= 5 && c <= 120
const testPercentile = (p, o) => onlyDigits(o) && p >= 1 && p <= 99

const disabledLabel = 'Fetch results with the current settings to enable button'

function createRegionalAnalysis(options: Record<string, unknown>) {
  return safeFetch(API.Regional, {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(options),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `bearer ${getUser().idToken}`,
      'X-Conveyal-Access-Group': getUser().adminTempAccessGroup
    }
  })
}

export default function CreateRegional({
  isDisabled,
  profileRequest,
  projectId,
  variantIndex
}) {
  const {isOpen, onOpen, onClose} = useDisclosure()
  return (
    <>
      <Button
        isDisabled={isDisabled}
        onClick={onOpen}
        rightIcon='small-add'
        title={isDisabled ? disabledLabel : 'Regional analysis'}
        variantColor='green'
      >
        Regional analysis
      </Button>
      {isOpen && (
        <CreateModal
          onClose={onClose}
          profileRequest={profileRequest}
          projectId={projectId}
          variantIndex={variantIndex}
        />
      )}
    </>
  )
}

function CreateModal({onClose, profileRequest, projectId, variantIndex}) {
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const opportunityDatasets = useSelector(selectOpportunityDatasets)
  const selectedOpportunityDataset = useSelector(activeOpportunityDataset)
  const [destinationPointSets, setDestinationPointSets] = useState(
    selectedOpportunityDataset ? [selectedOpportunityDataset._id] : []
  )
  const regionId = useSelector(selectCurrentRegionId)
  const router = useRouter()
  const maxTripDurationMinutes = useSelector(selectMaxTripDurationMinutes)
  const travelTimePercentile = useSelector(selectTravelTimePercentile)
  const workerVersion = get(profileRequest, 'workerVersion', '')
  const workerVersionHandlesMultipleDimensions: any =
    versionToNumber(workerVersion) > 50900 ||
    (workerVersion.length == 7 && workerVersion.indexOf('.') == -1)

  const nameInput = useInput({test: testContent, value: ''})

  const onChangeDestinationPointSets = useCallback(
    (datasets) => {
      if (!datasets || datasets.length > 6) return
      if (Array.isArray(datasets))
        setDestinationPointSets(datasets.map((d) => d._id))
      else setDestinationPointSets([datasets._id]) // single selection mode
    },
    [setDestinationPointSets]
  )

  const cutoffsInput = useInput({
    parse: parseStringAsIntArray,
    test: testCutoffs,
    value: get(profileRequest, 'cutoffsMinutes', defaultCutoffs)
  })

  const percentilesInput = useInput({
    parse: parseStringAsIntArray,
    test: testPercentiles,
    value: get(profileRequest, 'percentiles', defaultPercentiles)
  })

  const cutoffInput = useInput({
    parse: parseInt,
    test: testCutoff,
    value: maxTripDurationMinutes
  })

  const percentileInput = useInput({
    parse: parseInt,
    test: testPercentile,
    value: travelTimePercentile
  })

  async function create() {
    setIsCreating(true)
    let response
    if (workerVersionHandlesMultipleDimensions) {
      response = await createRegionalAnalysis({
        ...profileRequest,
        cutoffsMinutes: parseStringAsIntArray(cutoffsInput.value),
        destinationPointSetIds: destinationPointSets,
        name: nameInput.value,
        percentiles: parseStringAsIntArray(percentilesInput.value),
        projectId,
        variantIndex
      })
    } else {
      response = await createRegionalAnalysis({
        ...profileRequest,
        cutoffsMinutes: [parseInt(cutoffInput.value)],
        destinationPointSetIds: destinationPointSets,
        name: nameInput.value,
        percentiles: [parseInt(percentileInput.value)],
        projectId,
        variantIndex
      })
    }

    if (!response.ok) {
      console.error(response)
      setIsCreating(false)
      setError(response.data.message)
    } else {
      const {as, href} = routeTo('regionalAnalyses', {regionId})
      router.push(href, as)
    }
  }

  const createDisabled =
    nameInput.isInvalid ||
    cutoffsInput.isInvalid ||
    percentilesInput.isInvalid ||
    cutoffInput.isInvalid ||
    percentileInput.isInvalid ||
    destinationPointSets.length < 1

  return (
    <Modal
      closeOnOverlayClick={false}
      initialFocusRef={nameInput.ref}
      isOpen={true}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new regional analysis</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack mb={4} spacing={4}>
            {error && (
              <Alert status='error'>
                <AlertIcon />
                <AlertDescription>
                  Error creating regional analysis. {error}
                </AlertDescription>
              </Alert>
            )}
            <FormControl
              isDisabled={isCreating}
              mb={4}
              isRequired
              isInvalid={nameInput.isInvalid}
            >
              <FormLabel htmlFor={nameInput.id}>
                Regional analysis name
              </FormLabel>
              <Input {...nameInput} />
            </FormControl>

            <FormControl
              isDisabled={isCreating}
              isRequired
              isInvalid={
                destinationPointSets.length > 6 ||
                destinationPointSets.length === 0
              }
            >
              <FormLabel htmlFor='destinationPointSets'>
                Opportunity dataset
                {workerVersionHandlesMultipleDimensions ? '(s)' : ''}
              </FormLabel>
              <div>
                <Select
                  isClearable={false}
                  isDisabled={isCreating}
                  getOptionLabel={getFullODName}
                  getOptionValue={getId}
                  inputId='destinationPointSets'
                  isMulti={workerVersionHandlesMultipleDimensions}
                  onChange={onChangeDestinationPointSets}
                  options={opportunityDatasets}
                  value={
                    opportunityDatasets.filter((o) =>
                      destinationPointSets.includes(o._id)
                    ) as any
                  }
                />
              </div>
              {workerVersionHandlesMultipleDimensions && (
                <FormHelperText>Select up to 6 datasets.</FormHelperText>
              )}
            </FormControl>
          </Stack>

          {workerVersionHandlesMultipleDimensions ? (
            <Stack spacing={4}>
              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={cutoffsInput.isInvalid}
              >
                <FormLabel htmlFor={cutoffsInput.id}>Cutoff minutes</FormLabel>
                <Input
                  {...cutoffsInput}
                  value={
                    Array.isArray(cutoffsInput.value)
                      ? cutoffsInput.value.join(', ')
                      : cutoffsInput.value
                  }
                />
                <FormHelperText>From 5 to 120.</FormHelperText>
              </FormControl>

              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={percentilesInput.isInvalid}
              >
                <FormLabel htmlFor={percentilesInput.id}>Percentiles</FormLabel>
                <Input
                  {...percentilesInput}
                  value={
                    Array.isArray(percentilesInput.value)
                      ? percentilesInput.value.join(', ')
                      : percentilesInput.value
                  }
                />
                <FormHelperText>From 1 to 99.</FormHelperText>
              </FormControl>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={cutoffInput.isInvalid}
              >
                <FormLabel htmlFor={cutoffInput.id}>Cutoff minute</FormLabel>
                <Input {...cutoffInput} />
                <FormHelperText>From 5 to 120.</FormHelperText>
              </FormControl>

              <FormControl
                isDisabled={isCreating}
                isRequired
                isInvalid={percentileInput.isInvalid}
              >
                <FormLabel htmlFor={percentileInput.id}>Percentile</FormLabel>
                <Input {...percentileInput} />
                <FormHelperText>From 1 to 99.</FormHelperText>
              </FormControl>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            leftIcon='small-add'
            loadingText='Creating'
            isLoading={isCreating}
            isDisabled={createDisabled}
            mr={3}
            onClick={create}
            variantColor='green'
          >
            {message('common.create')}
          </Button>
          <Button isDisabled={isCreating} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
