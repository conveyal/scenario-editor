import {
  Badge,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalCloseButton,
  Select,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels
} from '@chakra-ui/react'
import get from 'lodash/get'
import toStartCase from 'lodash/startCase'
import {useState} from 'react'
import {useDispatch} from 'react-redux'

import {createModification} from 'lib/actions/modifications'
import {AddIcon} from 'lib/components/icons'
import {
  ADD_STREETS,
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  CUSTOM_MODIFICATION,
  MODIFY_STREETS,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE
} from 'lib/constants'
import useInput from 'lib/hooks/use-controlled-input'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'

const testContent = (s) => s && s.length > 0

const transitModificationTypes = [
  ADD_TRIP_PATTERN,
  ADJUST_DWELL_TIME,
  ADJUST_SPEED,
  CONVERT_TO_FREQUENCY,
  REMOVE_STOPS,
  REMOVE_TRIPS,
  REROUTE,
  CUSTOM_MODIFICATION
]

const streetModificationTypes = [ADD_STREETS, MODIFY_STREETS]

/**
 * Modal for creating a modification.
 */
export default function CreateModification({
  feeds,
  projectId,
  regionId,
  variants,
  ...p
}) {
  const dispatch = useDispatch<any>()
  const [isCreating, setIsCreating] = useState(false)
  const {isOpen, onClose, onOpen} = useDisclosure()
  const [tabIndex, setTabIndex] = useState(0)
  const nameInput = useInput({test: testContent, value: ''})
  const transitTypeInput = useInput({value: transitModificationTypes[0]})
  const streetTypeInput = useInput({value: streetModificationTypes[0]})
  const goToModificationEdit = useRouteTo('modificationEdit', {
    regionId,
    projectId
  })

  async function create() {
    setIsCreating(true)
    const type = tabIndex === 0 ? transitTypeInput.value : streetTypeInput.value
    const m: CL.IModification = await dispatch(
      createModification({
        feedId: get(feeds, '[0].feedId'), // default to the first feed
        name: nameInput.value,
        projectId,
        type,
        variants: variants.map(() => true)
      })
    )
    goToModificationEdit({modificationId: m?._id})
  }

  return (
    <>
      <Button
        isFullWidth
        onClick={onOpen}
        leftIcon={<AddIcon />}
        colorScheme='green'
        {...p}
      >
        {message('modification.create')}
      </Button>
      <Modal
        closeOnOverlayClick={false}
        initialFocusRef={nameInput.ref}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new modification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel htmlFor={nameInput.id}>
                {message('modification.name')}
              </FormLabel>
              <Input {...nameInput} placeholder='Name' />
            </FormControl>

            <Tabs isFitted mt={3} onChange={(index) => setTabIndex(index)}>
              <TabList>
                <Tab>Transit</Tab>
                <Tab>
                  Street{' '}
                  <Badge ml={3} colorScheme='red'>
                    Experimental
                  </Badge>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel pt={3}>
                  <FormControl>
                    <FormLabel htmlFor={transitTypeInput.id}>
                      Transit modification type
                    </FormLabel>
                    <Select {...transitTypeInput}>
                      {transitModificationTypes.map((type) => (
                        <option key={`type-${type}`} value={type}>
                          {toStartCase(type)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </TabPanel>
                <TabPanel pt={3}>
                  <FormControl>
                    <FormLabel htmlFor={streetTypeInput.id}>
                      Street modification type
                    </FormLabel>
                    <Select {...streetTypeInput}>
                      {streetModificationTypes.map((type) => (
                        <option key={`type-${type}`} value={type}>
                          {toStartCase(type)}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button
              leftIcon={<AddIcon />}
              isLoading={isCreating}
              isDisabled={!get(nameInput, 'value.length')}
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
    </>
  )
}
