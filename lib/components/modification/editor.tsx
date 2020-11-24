import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Flex,
  Stack,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  useDisclosure,
  useToast,
  AlertDescription,
  PseudoBox
} from '@chakra-ui/core'
import {
  faChevronLeft,
  faCode,
  faCopy,
  faTrash,
  faMousePointer
} from '@fortawesome/free-solid-svg-icons'
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import {Component, useCallback, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {
  copy as copyModification,
  deleteModification,
  updateModification as updateAndRetrieveFeedData
} from 'lib/actions/modifications'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import selectModificationFeed from 'lib/selectors/modification-feed'
import selectFeedIsLoaded from 'lib/selectors/modification-feed-is-loaded'
import selectSaveInProgress from 'lib/selectors/modification-save-in-progress'
import selectVariants from 'lib/selectors/variants'

import {ConfirmDialog} from '../confirm-button'
import Editable from '../editable'
import Icon from '../icon'
import IconButton from '../icon-button'
import InnerDock from '../inner-dock'
import AllModificationsMapDisplay from '../modifications-map/display-all'

import FitBoundsButton from './fit-bounds'
import JSONEditor from './json-editor'
import ModificationType from './type'
import Variants from './variants'

// Debounce the update function for five seconds
const DEBOUNCE_MS = 10 * 1000

// Shortened version
const hasOwnProperty = (o, p) => Object.prototype.hasOwnProperty.call(o, p)

// Test modification name is valid
const nameIsValid = (s) => s && s.length > 0

/**
 * Use a wrapper class to handle debouncing the updates
 */
export default class DebouncedUpdate extends Component<any> {
  componentDidMount() {
    window.addEventListener('beforeunload', this.debouncedSaveToServer.flush)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.debouncedSaveToServer.flush)
    // Call any debounced updates
    this.debouncedSaveToServer.flush()
  }

  /**
   * Wait until changes have stopped to save to the server to prevent extra
   * saves. Pass only the props in case the nonce was updated elsewhere.
   */
  debouncedSaveToServer = debounce((newProps) => {
    this.props.update({...this.props.modification, ...newProps})
  }, DEBOUNCE_MS)

  updateLocally = (newProps) => {
    // immediately
    this.props.updateLocally({...this.props.modification, ...newProps})
    // debounce until updates have stopped for a few seconds
    this.debouncedSaveToServer(newProps)
  }

  render() {
    return (
      <ModificationEditor
        debouncedSaveToServer={this.debouncedSaveToServer}
        modification={this.props.modification}
        query={this.props.query}
        updateLocally={this.updateLocally}
      />
    )
  }
}

/**
 * Show this toast when a modification has been copied.
 */
function CopiedModificationToast({modification, onClose, regionId}) {
  const goToModificationEdit = useRouteTo('modificationEdit', {
    modificationId: modification._id,
    projectId: modification.projectId,
    regionId
  })

  return (
    <Alert
      status='success'
      variant='solid'
      mt={2}
      cursor='pointer'
      onClick={() => {
        goToModificationEdit()
        onClose()
      }}
    >
      <AlertIcon />
      <AlertDescription>
        <PseudoBox _hover={{textDecoration: 'underline'}}>
          Modification has been copied successfully. Click here to go to the new
          copy.
        </PseudoBox>
      </AlertDescription>
    </Alert>
  )
}

function ModificationEditor({
  debouncedSaveToServer,
  modification,
  query,
  updateLocally
}) {
  const dispatch = useDispatch()
  const allVariants = useSelector(selectVariants)
  const feed = useSelector(selectModificationFeed)
  const feedIsLoaded = useSelector(selectFeedIsLoaded)
  const saveInProgress = useSelector(selectSaveInProgress)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDisclosure = useDisclosure()
  const toast = useToast()

  const goToAllModifications = useRouteTo('modifications', {
    regionId: query.regionId,
    projectId: query.projectId
  })

  const _remove = useCallback(async () => {
    setIsDeleting(true)
    // Cancel any pending updates
    debouncedSaveToServer.cancel()
    // Delete the modification
    await dispatch(deleteModification(modification._id))
    // Go to the all modifications page
    goToAllModifications()
    // Show a toast confirming deletion
    toast({
      position: 'top',
      title: `Modification "${modification.name}" deleted successfully`,
      status: 'success'
    })
  }, [
    dispatch,
    debouncedSaveToServer,
    modification,
    goToAllModifications,
    toast
  ])

  const _updateAndRetrieveFeedData = useCallback(
    (properties) => {
      dispatch(
        updateAndRetrieveFeedData({
          ...modification,
          ...properties
        })
      )
    },
    [dispatch, modification]
  )

  const _removeFeed = useCallback(() => {
    if (modification) {
      const m = modification
      const update = {feed: null}
      if (hasOwnProperty(m, 'routes')) m.routes = null
      if (hasOwnProperty(m, 'stops')) m.stops = null
      if (hasOwnProperty(m, 'trips')) m.trips = null
      if (hasOwnProperty(m, 'fromStop')) m.fromStop = null
      if (hasOwnProperty(m, 'toStop')) m.toStop = null
      _updateAndRetrieveFeedData(update)
    }
  }, [modification, _updateAndRetrieveFeedData])

  const _setVariant = useCallback(
    (variantIndex, active) => {
      const variants = get(modification, 'variants', [])

      // Could come from a bitset on the Java side so may be of varying length
      for (let i = 0; i < variants.length; i++) {
        if (variants[i] === undefined) variants[i] = false
      }

      variants[variantIndex] = active

      updateLocally({
        variants: [...variants]
      })
    },
    [modification, updateLocally]
  )

  const _copyModification = useCallback(async () => {
    debouncedSaveToServer.flush()
    const m = await dispatch(copyModification(modification._id))
    toast({
      position: 'top',
      render: ({onClose}) => (
        <CopiedModificationToast
          modification={m}
          onClose={onClose}
          regionId={query.regionId}
        />
      )
    })
  }, [debouncedSaveToServer, dispatch, modification, query, toast])

  if (isDeleting) return null

  return (
    <>
      <AllModificationsMapDisplay isEditing={true} />

      {deleteDisclosure.isOpen && (
        <ConfirmDialog
          action={message('modification.deleteModification')}
          description={message('modification.deleteConfirmation')}
          onClose={deleteDisclosure.onClose}
          onConfirm={_remove}
        />
      )}

      <Flex
        align='center'
        borderBottom='1px solid #E2E8F0'
        className={saveInProgress ? 'disableAndDim' : ''}
        p={2}
        width='320px'
      >
        <IconButton
          icon={faChevronLeft}
          label='Modifications'
          onClick={goToAllModifications}
        />

        <Box flex='1' fontSize='xl' fontWeight='bold' ml={2} overflow='hidden'>
          <Editable
            isValid={nameIsValid}
            onChange={(name) => updateLocally({name})}
            value={modification.name}
          />
        </Box>

        <Flex>
          <div>
            <FitBoundsButton />
          </div>
          <IconButton
            label={message('modification.copyModification')}
            icon={faCopy}
            onClick={() => _copyModification()}
          />
          <IconButton
            label={message('modification.deleteModification')}
            icon={faTrash}
            onClick={deleteDisclosure.onOpen}
            variantColor='red'
          />
        </Flex>
      </Flex>
      <InnerDock className={saveInProgress ? 'disableAndDim' : ''}>
        {feedIsLoaded ? (
          modification ? (
            <Tabs align='end' p={4} variant='soft-rounded'>
              <TabPanels>
                <TabPanel>
                  <Stack spacing={4}>
                    <Box>
                      <Editable
                        onChange={(description) => updateLocally({description})}
                        placeholder={message('modification.addDescription')}
                        value={modification.description}
                      />
                    </Box>

                    {get(modification, 'routes.length') > 1 && (
                      <Alert status='warning'>
                        {message('modification.onlyOneRoute')}
                      </Alert>
                    )}

                    <Box>
                      <ModificationType
                        modification={modification}
                        selectedFeed={feed}
                        type={modification.type}
                        update={updateLocally}
                        updateAndRetrieveFeedData={_updateAndRetrieveFeedData}
                      />
                    </Box>

                    <Box>
                      <Variants
                        activeVariants={modification.variants}
                        allVariants={allVariants}
                        setVariant={_setVariant}
                      />
                    </Box>
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <JSONEditor
                    modification={modification}
                    save={updateLocally}
                  />
                </TabPanel>
              </TabPanels>

              <Divider my={4} />

              <TabList>
                <Tab aria-label='Edit value'>
                  <Icon icon={faMousePointer} />
                </Tab>
                <Tab aria-label='Edit JSON'>
                  <Icon icon={faCode} />
                </Tab>
              </TabList>
            </Tabs>
          ) : (
            <Text>Loading modification...</Text>
          )
        ) : (
          <Stack spacing={4}>
            <Text>Loading modification feed...</Text>
            <Text>{message('modification.clearBundleInfo')}</Text>
            <Button
              isFullWidth
              onClick={_removeFeed}
              className='DEV'
              variantColor='yellow'
            >
              {message('modification.clearBundleConfirm')}
            </Button>
          </Stack>
        )}
      </InnerDock>
    </>
  )
}
