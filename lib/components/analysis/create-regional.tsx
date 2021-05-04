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
  AlertDescription,
  Divider,
  useToast,
  Box
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import sort from 'lodash/sortBy'
import {useCallback, useMemo, useState} from 'react'
import {useSelector, useStore} from 'react-redux'

import {AddIcon} from 'lib/components/icons'
import {API} from 'lib/constants'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import useUser from 'lib/hooks/use-user'
import message from 'lib/message'
import {
  activeOpportunityDataset,
  opportunityDatasets as selectOpportunityDatasets
} from 'lib/modules/opportunity-datasets/selectors'
import {versionToNumber} from 'lib/modules/r5-version/utils'
import selectCurrentRegionId from 'lib/selectors/current-region-id'
import selectMaxTripDurationMinutes from 'lib/selectors/max-trip-duration-minutes'
import selectTravelTimePercentile from 'lib/selectors/travel-time-percentile'
import authenticatedFetch from 'lib/utils/auth-fetch'
import calculateGridPoints from 'lib/utils/calculate-grid-points'

import Select from '../select'
import DocsLink from '../docs-link'

// For react-select options
const getId = fpGet('_id')

// Combine the source name with the name
const getFullODName = (od) => od.label || `${od.sourceName}: ${od.name}`

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

export default function CreateRegional({
  isComparison,
  isDisabled,
  projectId,
  variantIndex
}) {
  const {isOpen, onOpen, onClose} = useDisclosure()
  return (
    <>
      <Button
        isDisabled={isDisabled}
        onClick={onOpen}
        rightIcon={<AddIcon />}
        title={isDisabled ? disabledLabel : 'Regional analysis'}
        colorScheme='green'
      >
        Regional analysis
      </Button>
      {isOpen && (
        <CreateModal
          isComparison={isComparison}
          onClose={onClose}
          projectId={projectId}
          variantIndex={variantIndex}
        />
      )}
    </>
  )
}

function CreatedRegionalToast({onClose, regionId}) {
  const goToRegionalAnalyses = useRouteTo('regionalAnalyses', {
    regionId
  })

  return (
    <Alert
      status='success'
      variant='solid'
      mt={2}
      cursor='pointer'
      onClick={() => {
        goToRegionalAnalyses()
        onClose()
      }}
    >
      <AlertIcon />
      <AlertDescription>
        <Box _hover={{textDecoration: 'underline'}}>
          Regional analysis has been created successfully. Click here to view
          progress.
        </Box>
      </AlertDescription>
    </Alert>
  )
}

const defaultOriginPointSet = {
  label: 'Rectangular Grid',
  value: 'rectangular-grid'
}

function useProfileRequest(isComparison: boolean) {
  const store = useStore()
  const profileRequest = useMemo(
    () =>
      get(
        store.getState(),
        `analysis.requestSettings[${isComparison ? 1 : 0}]`
      ),
    [isComparison, store]
  )
  return profileRequest
}

function CreateModal({onClose, isComparison, projectId, variantIndex}) {
  const toast = useToast()
  const user = useUser()
  const profileRequest = useProfileRequest(isComparison)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const opportunityDatasets = useSelector(selectOpportunityDatasets)
  const selectedOpportunityDataset = useSelector(activeOpportunityDataset)
  const [originPointSet, setOriginPointSet] = useState(defaultOriginPointSet)
  const [destinationPointSets, setDestinationPointSets] = useState(
    selectedOpportunityDataset ? [selectedOpportunityDataset._id] : []
  )
  const regionId = useSelector(selectCurrentRegionId)
  const maxTripDurationMinutes = useSelector(selectMaxTripDurationMinutes)
  const travelTimePercentile = useSelector(selectTravelTimePercentile)
  const workerVersion = get(profileRequest, 'workerVersion', '')
  const workerVersionHandlesMultipleDimensions: any =
    versionToNumber(workerVersion) > 50900 ||
    (workerVersion.length == 7 && workerVersion.indexOf('.') == -1)
  const freeformPointSets = opportunityDatasets.filter(
    (od) => od.format === 'FREEFORM'
  )

  const totalOrigins: number =
    originPointSet === defaultOriginPointSet
      ? calculateGridPoints(profileRequest.bounds, profileRequest.zoom)
      : get(originPointSet, 'totalPoints')

  const nameInput = useInput({test: testContent, value: ''})

  const onChangeDestinationPointSets = useCallback(
    (datasets) => {
      if (!datasets || datasets.length > 12) return
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
    const cutoffsMinutes = workerVersionHandlesMultipleDimensions
      ? parseStringAsIntArray(cutoffsInput.value)
      : [parseInt(cutoffInput.value)]
    const percentiles = workerVersionHandlesMultipleDimensions
      ? parseStringAsIntArray(percentilesInput.value)
      : [parseInt(percentileInput.value)]

    const options = {
      ...profileRequest,
      cutoffsMinutes,
      destinationPointSetIds: destinationPointSets,
      originPointSetId:
        originPointSet.value !== 'grid' ? get(originPointSet, '_id') : null,
      name: nameInput.value,
      percentiles,
      projectId,
      variantIndex
    }

    const response = await authenticatedFetch(API.Regional, user, {
      method: 'POST',
      body: JSON.stringify(options)
    })

    if (response.ok === true) {
      onClose() // Close modal before showing the toast

      toast({
        position: 'top',
        render: ({onClose}) => (
          <CreatedRegionalToast onClose={onClose} regionId={regionId} />
        )
      })
    } else {
      console.error(response)
      setIsCreating(false)
      setError(response.error.message)
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
      size='lg'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Create new regional analysis{' '}
          <DocsLink to='analysis/regional#starting-a-regional-analysis' />
        </ModalHeader>
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

            <FormControl isDisabled={isCreating} isRequired>
              <FormLabel htmlFor='originPointSet'>Origin points</FormLabel>
              <div>
                <Select
                  isDisabled={isCreating}
                  getOptionLabel={getFullODName}
                  getOptionValue={getId}
                  inputId='originPointSet'
                  onChange={setOriginPointSet}
                  options={[defaultOriginPointSet, ...freeformPointSets]}
                  value={originPointSet}
                />
              </div>
            </FormControl>

            <Alert status='info'>
              <AlertIcon />
              <AlertDescription>
                Analysis will run for{' '}
                {Math.round(totalOrigins).toLocaleString()} origin points
              </AlertDescription>
            </Alert>

            <Divider />

            <FormControl
              isDisabled={isCreating}
              isRequired
              isInvalid={
                destinationPointSets.length > 6 ||
                destinationPointSets.length === 0
              }
            >
              <FormLabel htmlFor='destinationPointSets'>
                Destination opportunity layer
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
                <FormHelperText>Select up to 12 layers.</FormHelperText>
              )}
            </FormControl>

            <Divider />
          </Stack>

          {workerVersionHandlesMultipleDimensions ? (
            <Stack isInline spacing={4}>
              <Stack spacing={4}>
                <FormControl
                  isDisabled={isCreating}
                  isRequired
                  isInvalid={cutoffsInput.isInvalid}
                >
                  <FormLabel htmlFor={cutoffsInput.id}>
                    Cutoff minutes
                  </FormLabel>
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
              </Stack>
              <Stack spacing={4}>
                <FormControl
                  isDisabled={isCreating}
                  isRequired
                  isInvalid={percentilesInput.isInvalid}
                >
                  <FormLabel htmlFor={percentilesInput.id}>
                    Percentiles
                  </FormLabel>
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
            </Stack>
          ) : (
            <Stack isInline spacing={4}>
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
              </Stack>
              <Stack spacing={4}>
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
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            leftIcon={<AddIcon />}
            loadingText='Creating'
            isLoading={isCreating}
            isDisabled={createDisabled}
            mr={3}
            onClick={create}
            colorScheme='green'
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
