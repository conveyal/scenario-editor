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
  TabPanels
} from '@chakra-ui/react'
import toStartCase from 'lodash/startCase'
import {memo} from 'react'

import useRouteTo from 'lib/hooks/use-route-to'
import message from 'lib/message'
import useModificationsOnMap from 'lib/modification/hooks/use-modifications-on-map'
import useFilteredModifications from 'lib/modification/hooks/use-filtered-modifications'
import ScenariosEditor from 'lib/scenario/components/editor'

import IconButton from '../icon-button'
import {HideIcon, SearchIcon, ShowIcon, UploadIcon} from '../icons'
import InnerDock from '../inner-dock'
import Link from '../link'
import {DisplayAll as ModificationsMap} from '../modifications-map/display-all'

import CreateModification from './create'

export default function ModificationsList({
  bundle,
  modifications,
  project
}: {
  bundle: CL.Bundle
  modifications: CL.Modification[]
  project: CL.Project
}) {
  const modificationsOnMap = useModificationsOnMap()
  const filter = useFilteredModifications(modifications, project._id)
  const goToModificationImport = useRouteTo('modificationImport', {
    projectId: project._id,
    regionId: project.regionId
  })

  return (
    <>
      <ModificationsMap
        bundle={bundle}
        modifications={modifications.filter(
          (m) =>
            !!modificationsOnMap
              .forProject(project._id)
              .find((_id) => _id === m._id)
        )}
      />

      <Tabs isFitted isLazy width='320px'>
        <TabList>
          <Tab _focus={{outline: 'none'}}>
            {message('modification.plural')}{' '}
            <Badge ml={2}>{modifications.length}</Badge>
          </Tab>
          <Tab _focus={{outline: 'none'}}>{message('scenario.plural')}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel pt={2} px={0}>
            <Box px={2}>
              <CreateModification />
            </Box>
            <Flex align='center' justify='space-between' p={2}>
              <InputGroup flex='1' pl={2}>
                <InputLeftElement pl={4} pr={2}>
                  <SearchIcon />
                </InputLeftElement>
                <Input
                  placeholder={message('modification.filter')}
                  onChange={(e) => filter.set(e.target.value)}
                  type='text'
                  value={filter.value}
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
                <IconButton
                  label='Show all modifications'
                  onClick={() =>
                    modificationsOnMap.setAll(
                      project._id,
                      modifications.map((m) => m._id)
                    )
                  }
                >
                  <ShowIcon />
                </IconButton>
                <IconButton
                  label='Hide all modifications'
                  onClick={() => modificationsOnMap.setAll(project._id, [])}
                >
                  <HideIcon />
                </IconButton>
              </Flex>
            </Flex>

            <InnerDock>
              {modifications.length > 0 ? (
                <Accordion
                  allowMultiple
                  defaultIndex={Object.keys(filter.modifications).map(
                    (_, i) => i
                  )}
                >
                  {Object.keys(filter.modifications).map((type) => {
                    const ms = filter.modifications[type]
                    return (
                      <ModificationType
                        key={type}
                        modificationCount={ms.length}
                        type={type}
                      >
                        {ms.map((m) => (
                          <ModificationItem
                            isDisplayed={modificationsOnMap.isOnMap(
                              project._id,
                              m._id
                            )}
                            key={m._id}
                            modification={m}
                            regionId={project.regionId}
                            toggleMapDisplay={() =>
                              modificationsOnMap.toggle(project._id, m._id)
                            }
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

          <TabPanel p={0}>
            <ScenariosEditor projectId={project._id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

function ModificationType({children, modificationCount, type}) {
  return (
    <AccordionItem border='none' isDisabled={modificationCount === 0}>
      {({isExpanded}) => (
        <>
          <h3>
            <AccordionButton _focus={{outline: 'none'}} py={2}>
              <Box flex='1' fontWeight='bold' textAlign='left'>
                {toStartCase(type)} <Badge>{modificationCount}</Badge>
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel py={0} px={1}>
            {isExpanded && <Flex direction='column'>{children}</Flex>}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  )
}

type ModificationItemProps = {
  isDisplayed: boolean
  modification: CL.Modification
  regionId: string
  toggleMapDisplay: (_id: string) => void
}

const ModificationItem = memo<ModificationItemProps>(
  ({isDisplayed, modification, regionId, toggleMapDisplay}) => (
    <Flex align='center' px={1}>
      <Link
        to='modificationEdit'
        query={{
          modificationId: modification._id,
          projectId: modification.projectId,
          regionId
        }}
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
        {isDisplayed ? <ShowIcon /> : <HideIcon />}
      </IconButton>
    </Flex>
  )
)
