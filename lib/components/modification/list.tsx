import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useDisclosure
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import get from 'lodash/get'
import toStartCase from 'lodash/startCase'
import Link from 'next/link'
import {memo, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import getFeedsRoutesAndStops from 'lib/actions/get-feeds-routes-and-stops'
import {LS_MOM} from 'lib/constants'
import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import {toHref} from 'lib/router'
import selectFeedsById from 'lib/selectors/feeds-by-id'
import selectVariants from 'lib/selectors/variants'
import {getParsedItem, stringifyAndSet} from 'lib/utils/local-storage'

import IconButton from '../icon-button'
import {HideIcon, SearchIcon, ShowIcon, UploadIcon} from '../icons'
import InnerDock from '../inner-dock'
import {DisplayAll as ModificationsMap} from '../modifications-map/display-all'
import VariantEditor from '../variant-editor'

import CreateModification from './create'

type Modification = {
  _id: string
  projectId: string
  name: string
}

function filterModifications(
  filter: string,
  modifications: CL.IModification[],
  projectId: string
) {
  const filterLcase = filter != null ? filter.toLowerCase() : ''
  const filteredModificationsByType = {}

  modifications
    .filter((m) => m.projectId === projectId)
    .filter(
      (m) => filter === null || m.name?.toLowerCase().indexOf(filterLcase) > -1
    )
    .forEach((m) => {
      filteredModificationsByType[m.type] = [
        ...(filteredModificationsByType[m.type] || []),
        m
      ]
    })

  return filteredModificationsByType
}

const selectModifications = fpGet('project.modifications')

export default function ModificationsList({bundle, project}) {
  const dispatch = useDispatch()
  const {_id: projectId, bundleId, regionId} = project
  // Retrieve the modifications from the store. Filter out modifications that might be from another project
  const modifications = useSelector(selectModifications)
  const feedsById = useSelector(selectFeedsById)
  const variants = useSelector(selectVariants)
  const goToModificationImport = useRouteTo('modificationImport', {
    projectId,
    regionId
  })

  // Array of ids for currently displayed modifications
  const [modificationsOnMap, setModificationsOnMap] = useState<Modification[]>(
    () => {
      const _idsOnMap: string[] = get(
        getParsedItem(LS_MOM),
        projectId,
        []
      ) as string[]
      return modifications.filter((m) => _idsOnMap.includes(m._id))
    }
  )

  // Load the GTFS information for the modifications
  useEffect(() => {
    if (modificationsOnMap.length > 0) {
      dispatch(
        getFeedsRoutesAndStops({
          bundleId,
          forceCompleteUpdate: true,
          modifications: modificationsOnMap
        })
      )
    }
  }, [bundleId, dispatch, modifications, modificationsOnMap])

  // Set and store modifications on map
  const setAndStoreMoM = useCallback(
    (_idsOnMap) => {
      const mom = getParsedItem(LS_MOM) || {}
      mom[projectId] = _idsOnMap
      stringifyAndSet(LS_MOM, mom)
      setModificationsOnMap(
        modifications.filter((m) => _idsOnMap.includes(m._id))
      )
    },
    [modifications, projectId]
  )

  const [filter, setFilter] = useState('')
  const [filteredModificationsByType, setFiltered] = useState(() =>
    filterModifications(filter, modifications, projectId)
  )

  // Update filtered modifications when the filter changes
  useEffect(() => {
    setFiltered(filterModifications(filter, modifications, projectId))
  }, [filter, modifications, projectId])

  // Show a variant's modifications on the map
  const showVariant = useCallback(
    (index) => {
      setAndStoreMoM(
        modifications
          .filter((m) => m.variants[index] === true)
          .map((m) => m._id)
      )
    },
    [modifications, setAndStoreMoM]
  )

  // Show/hide all modifications
  const showAll = useCallback(() => {
    setAndStoreMoM(modifications.map((m) => m._id))
  }, [modifications, setAndStoreMoM])
  const hideAll = useCallback(() => {
    setAndStoreMoM([])
  }, [setAndStoreMoM])

  // Toggle map appearance
  const toggleMapDisplay = useCallback(
    (_id) => {
      if (modificationsOnMap.find((m) => m._id === _id)) {
        setAndStoreMoM(
          modificationsOnMap.filter((m) => m._id !== _id).map((m) => m._id)
        )
      } else {
        setAndStoreMoM([...modificationsOnMap.map((m) => m._id), _id])
      }
    },
    [modificationsOnMap, setAndStoreMoM]
  )

  return (
    <>
      <ModificationsMap
        feedsById={feedsById}
        modifications={modificationsOnMap}
      />

      <Tabs isFitted width='320px'>
        <TabList>
          <Tab _focus={{outline: 'none'}}>
            {message('modification.plural')}{' '}
            <Badge ml={2}>{modifications.length}</Badge>
          </Tab>
          <Tab _focus={{outline: 'none'}}>{message('variant.plural')}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel pt={2}>
            <Box px={2}>
              <CreateModification
                feeds={bundle.feeds}
                projectId={projectId}
                regionId={regionId}
                variants={variants}
              />
            </Box>
            <Flex align='center' justify='space-between' p={2}>
              <InputGroup flex='1' pl={2}>
                <InputLeftElement pl={4} pr={2}>
                  <SearchIcon />
                </InputLeftElement>
                <Input
                  placeholder={message('modification.filter')}
                  onChange={(e) => setFilter(e.target.value)}
                  type='text'
                  value={filter}
                  variant='flushed'
                />
              </InputGroup>
              <Flex ml={2}>
                <IconButton
                  label={message('modification.importFromProject')}
                  onClick={goToModificationImport}
                >
                  <UploadIcon />
                </IconButton>
                <IconButton label='Show all modifications' onClick={showAll}>
                  <ShowIcon />
                </IconButton>
                <IconButton label='Hide all modifications' onClick={hideAll}>
                  <HideIcon />
                </IconButton>
              </Flex>
            </Flex>

            <InnerDock>
              {modifications.length > 0 ? (
                <Accordion allowMultiple>
                  {Object.keys(filteredModificationsByType).map((type) => {
                    const ms = filteredModificationsByType[type]
                    return (
                      <ModificationType
                        key={type}
                        modificationCount={ms.length}
                        type={type}
                      >
                        {ms.map((m) => (
                          <ModificationItem
                            isDisplayed={
                              modificationsOnMap.find(
                                (mom) => mom._id === m._id
                              ) !== undefined
                            }
                            key={m._id}
                            modification={m}
                            regionId={regionId}
                            toggleMapDisplay={toggleMapDisplay}
                          />
                        ))}
                      </ModificationType>
                    )
                  })}
                </Accordion>
              ) : (
                <Box p={4} textAlign='center'>
                  No modifications have been added to this project yet.
                </Box>
              )}
            </InnerDock>
          </TabPanel>

          <TabPanel>
            <VariantEditor showVariant={showVariant} variants={variants} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

function ModificationType({children, modificationCount, type}) {
  const {isOpen, onToggle} = useDisclosure({isOpen: true}) // defaultIsOpen does not currently work
  return (
    <AccordionItem
      border='none'
      isOpen={isOpen}
      isDisabled={modificationCount === 0}
      onChange={onToggle}
    >
      <h3>
        <AccordionButton _focus={{outline: 'none'}} py={2}>
          <Box flex='1' fontWeight='bold' textAlign='left'>
            {toStartCase(type)} <Badge>{modificationCount}</Badge>
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h3>
      <AccordionPanel py={0} px={1}>
        {isOpen && <Flex direction='column'>{children}</Flex>}
      </AccordionPanel>
    </AccordionItem>
  )
}

type ModificationItemProps = {
  isDisplayed: boolean
  modification: Modification
  regionId: string
  toggleMapDisplay: (_id: string) => void
}

const ModificationItem = memo<ModificationItemProps>(
  ({isDisplayed, modification, regionId, toggleMapDisplay}) => (
    <Flex align='center' px={1}>
      <Link
        href={toHref('modificationEdit', {
          modificationId: modification._id,
          projectId: modification.projectId,
          regionId
        })}
        passHref
      >
        <Button
          aria-label={`Edit modification ${modification.name}`}
          flex='1'
          justifyContent='start'
          overflow='hidden'
          px={4}
          style={{textOverflow: 'ellipsis'}}
          variant='ghost'
          colorScheme='blue'
          whiteSpace='nowrap'
        >
          {modification.name}
        </Button>
      </Link>
      <IconButton
        label={isDisplayed ? 'Hide from map' : 'Show on map'}
        onClick={(e) => {
          e.preventDefault()
          toggleMapDisplay(modification._id)
        }}
      >
        {isDisplayed ? <HideIcon /> : <ShowIcon />}
      </IconButton>
    </Flex>
  )
)
