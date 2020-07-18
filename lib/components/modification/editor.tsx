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
import dynamic from 'next/dynamic'
import React, {useState} from 'react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

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

// Not every modification still uses this editor. Load dynamically
const ModificationMapEdit = dynamic(() => import('../modifications-map/edit'))

// Debounce the update function for five seconds
const DEBOUNCE_MS = 10 * 1000

// Shortened version
const hasOwnProperty = (o, p) => Object.prototype.hasOwnProperty.call(o, p)

// Test modification name is valid
const nameIsValid = (s) => s && s.length > 0

/**
 * Use a wrapper class to handle debouncing the updates
 */
export default class DebouncedUpdate extends React.Component<any> {
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
        {...this.props}
        debouncedSaveToServer={this.debouncedSaveToServer}
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

function ModificationEditor(p) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [mapState, setMapState] = useState(null)
  const deleteDisclosure = useDisclosure()
  const toast = useToast()

  const goToAllModifications = useRouteTo('modifications', {
    regionId: p.query.regionId,
    projectId: p.query.projectId
  })

  function _remove() {
    setIsDeleting(true)
    // Cancel any pending updates
    p.debouncedSaveToServer.cancel()
    // Delete the modification
    p.removeModification(p.modification)
  }

  function _updateAndRetrieveFeedData(properties) {
    p.updateAndRetrieveFeedData({
      ...p.modification,
      ...properties
    })
  }

  function _removeFeed() {
    if (p.modification) {
      const m = p.modification
      const update = {feed: null}
      if (hasOwnProperty(m, 'routes')) m.routes = null
      if (hasOwnProperty(m, 'stops')) m.stops = null
      if (hasOwnProperty(m, 'trips')) m.trips = null
      if (hasOwnProperty(m, 'fromStop')) m.fromStop = null
      if (hasOwnProperty(m, 'toStop')) m.toStop = null
      _updateAndRetrieveFeedData(update)
    }
  }

  function _setVariant(variantIndex, active) {
    const variants = get(p, 'modification.variants', [])

    // Could come from a bitset on the Java side so may be of varying length
    for (let i = 0; i < variants.length; i++) {
      if (variants[i] === undefined) variants[i] = false
    }

    variants[variantIndex] = active

    p.updateLocally({
      variants: [...variants]
    })
  }

  function _copyModification() {
    p.debouncedSaveToServer.flush()
    p.copyModification(p.modification).then((m) => {
      toast({
        position: 'top',
        render: ({onClose}) => (
          <CopiedModificationToast
            modification={m}
            onClose={onClose}
            regionId={p.query.regionId}
          />
        )
      })
    })
  }

  if (isDeleting) return null

  const disableAndDim = `block ${p.saveInProgress ? 'disableAndDim' : ''}`
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
        className={p.saveInProgress ? 'disableAndDim' : ''}
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
            onChange={(name) => p.updateLocally({name})}
            value={p.modification.name}
          />
        </Box>

        <Flex>
          <Box>
            <FitBoundsButton />
          </Box>
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
      <InnerDock className={disableAndDim}>
        {p.feedIsLoaded ? (
          p.modification ? (
            <>
              {mapState && (
                <ModificationMapEdit
                  feed={p.feed}
                  key={`mme-${p.modification._id}`}
                  mapState={mapState}
                  modification={p.modification}
                  setMapState={setMapState}
                  updateModification={p.updateLocally}
                />
              )}

              <Tabs align='end' variant='soft-rounded'>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={4}>
                      <Box>
                        <Editable
                          onChange={(description) =>
                            p.updateLocally({description})
                          }
                          placeholder={message('modification.addDescription')}
                          value={p.modification.description}
                        />
                      </Box>

                      {get(p, 'modification.routes.length') > 1 && (
                        <Alert status='warning'>
                          {message('modification.onlyOneRoute')}
                        </Alert>
                      )}

                      <Box>
                        <ModificationType
                          mapState={mapState}
                          modification={p.modification}
                          selectedFeed={p.feed}
                          setMapState={setMapState}
                          type={p.modification.type}
                          update={p.updateLocally}
                          updateAndRetrieveFeedData={_updateAndRetrieveFeedData}
                        />
                      </Box>

                      <Box>
                        <Variants
                          activeVariants={p.modification.variants}
                          allVariants={p.allVariants}
                          setVariant={_setVariant}
                        />
                      </Box>
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <JSONEditor
                      modification={p.modification}
                      save={p.updateLocally}
                    />
                  </TabPanel>
                </TabPanels>

                <Divider my={4} />

                <TabList>
                  <Tab>
                    <Icon icon={faMousePointer} />
                  </Tab>
                  <Tab>
                    <Icon icon={faCode} />
                  </Tab>
                </TabList>
              </Tabs>
            </>
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
