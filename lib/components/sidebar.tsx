import {
  Badge,
  Box,
  Center,
  CenterProps,
  Flex,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  useColorMode,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'
import fpGet from 'lodash/fp/get'
import omit from 'lodash/omit'
import {useRouter} from 'next/router'
import {memo, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

import {AUTH_DISABLED, CB_DARK, CB_HEX, PageKey} from 'lib/constants'
import {CREATING_ID} from 'lib/constants/region'
import {SIDEBAR_Z} from 'lib/constants/z-index'
import useActivity from 'lib/hooks/use-activity'
import useRouteChanging from 'lib/hooks/use-route-changing'
import useRouteTo from 'lib/hooks/use-route-to'
import useUser from 'lib/hooks/use-user'
import message from 'lib/message'
import {routeTo} from 'lib/router'
import selectOutstandingRequests from 'lib/selectors/outstanding-requests'

import {
  ActivityIcon,
  BundlesIcon,
  EditIcon,
  InfoIcon,
  MoonIcon,
  ProjectsIcon,
  RegionsIcon,
  ResourcesIcon,
  RegionalAnalysisIcon,
  SinglePointAnalysisIcon,
  SignOutIcon,
  SpatialDatasetsIcon,
  SunIcon
} from './icons'
import SVGLogo from './logo.svg'
import Spinner from './spinner'
import TaskList from './task-list'
import Tip from './tip'

const sidebarWidth = '40px'

const NavItemContents = memo<CenterProps>(({children, ...p}) => {
  return (
    <Center
      borderBottom='2px solid rgba(0, 0, 0, 0)'
      boxSize={sidebarWidth}
      cursor='pointer'
      color={CB_HEX}
      fontSize='14px'
      width={sidebarWidth}
      _focus={{
        outline: 'none'
      }}
      _hover={{
        color: CB_DARK
      }}
      {...p}
    >
      {children}
    </Center>
  )
})

function useIsActive(to: PageKey, params = {}) {
  const [, pathname] = useRouteChanging()
  const route = routeTo(to, params)
  route.href = route.href.split('?')[0]
  route.as = route.as.split('?')[0]
  const pathOnly = pathname.split('?')[0]
  // Server === 'href', client === 'as'
  return pathOnly === route.href || pathOnly === route.as
}

type ItemLinkProps = {
  children: React.ReactNode
  label: string
  to: PageKey
  params?: any
}

/**
 * Render an ItemLink.
 */
const ItemLink = memo<ItemLinkProps>(({children, label, to, params = {}}) => {
  const isActive = useIsActive(to, params)
  const goToLink = useRouteTo(to, params)
  const bg = useColorModeValue('white', 'gray.900')

  const navItemProps = isActive
    ? {
        bg,
        borderBottom: `2px solid ${CB_HEX}`
      }
    : {onClick: () => goToLink()}

  return (
    <Tip isDisabled={isActive} label={label} placement='right'>
      <div>
        <NavItemContents {...navItemProps} aria-label={label} role='button'>
          {children}
        </NavItemContents>
      </div>
    </Tip>
  )
})

// Selector for getting the queryString out of the store
const selectQueryString = fpGet('queryString')

export default function Sidebar() {
  const router = useRouter()
  const user = useUser()
  const email = user?.email
  const storeParams = useSelector(selectQueryString)
  const queryParams = {...router.query, ...storeParams}
  const regionOnly = {regionId: queryParams.regionId}
  const bg = useColorModeValue('gray.200', 'gray.800')
  const colorMode = useColorMode()

  return (
    <Flex
      bg={bg}
      direction='column'
      height='100vh'
      id='sidebar'
      justify='space-between'
      width={sidebarWidth}
      zIndex={SIDEBAR_Z}
    >
      <div>
        <NavItemContents fontSize='22px' my={12}>
          <LogoSpinner />
        </NavItemContents>

        <ItemLink label={message('nav.regions')} to='regions'>
          <RegionsIcon />
        </ItemLink>
        {queryParams.regionId && queryParams.regionId !== CREATING_ID && (
          <>
            <ItemLink
              label={message('nav.projects')}
              to='projects'
              params={regionOnly}
            >
              <ProjectsIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.networkBundles')}
              to='bundles'
              params={regionOnly}
            >
              <BundlesIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.opportunityDatasets')}
              to='opportunities'
              params={queryParams}
            >
              <SpatialDatasetsIcon />
            </ItemLink>
            <Box className='DEV'>
              <ItemLink
                label={message('nav.resources')}
                to='resources'
                params={queryParams}
              >
                <ResourcesIcon />
              </ItemLink>
            </Box>
            <ItemLink
              label={message('nav.editModifications')}
              to={queryParams.projectId ? 'modifications' : 'projectSelect'}
              params={queryParams}
            >
              <EditIcon />
            </ItemLink>
            <ItemLink
              label={message('nav.analyze')}
              to='analysis'
              params={omit(queryParams, 'modificationId')}
            >
              <SinglePointAnalysisIcon />
            </ItemLink>
            <ItemLink
              label='Regional Analyses'
              to='regionalAnalyses'
              params={queryParams}
            >
              <RegionalAnalysisIcon />
            </ItemLink>
          </>
        )}
      </div>

      <div>
        <ActivityItem />

        <Tip label='Toggle color mode' placement='right'>
          <div>
            <NavItemContents
              className='DEV'
              onClick={colorMode.toggleColorMode}
            >
              {colorMode.colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            </NavItemContents>
          </div>
        </Tip>

        {!AUTH_DISABLED && (
          <ItemLink
            label={
              message('authentication.logOut') +
              ' - ' +
              message('authentication.username', {username: email})
            }
            to='logout'
          >
            <SignOutIcon />
          </ItemLink>
        )}

        <ExternalLink
          label={message('nav.help')}
          href='https://docs.conveyal.com'
        >
          <InfoIcon />
        </ExternalLink>
      </div>
    </Flex>
  )
}

function getActivityColor(tasks: CL.Task[]): string {
  if (tasks.length === 0) return 'gray'
  if (tasks.find((p) => p.state === 'ERROR')) return 'red'
  if (tasks.find((p) => p.state === 'ACTIVE')) return 'green'
  return 'blue'
}

function ActivityItem() {
  const {tasks} = useActivity()
  const {isOpen, onClose, onOpen} = useDisclosure()
  const activityColor = getActivityColor(tasks)
  const [previousTasksLength, setPreviousTasksLength] = useState(tasks.length)

  // If there is a brand new task, open the popover.
  useEffect(() => {
    if (tasks.length !== previousTasksLength) {
      setPreviousTasksLength(tasks.length)
      if (!isOpen && tasks.length > previousTasksLength) {
        onOpen()
      }
    }
  }, [tasks, previousTasksLength, isOpen, onOpen])

  if (tasks.length === 0) {
    return (
      <Tip label='No current activity' placement='right'>
        <div>
          <NavItemContents color='gray.500' _hover={{color: 'gray.600'}}>
            <ActivityIcon />
          </NavItemContents>
        </div>
      </Tip>
    )
  }

  return (
    <Popover
      closeDelay={750}
      isLazy
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
      placement='right'
      trigger='hover'
    >
      <PopoverTrigger>
        <div aria-label='Activity'>
          <NavItemContents
            color={`${activityColor}.500`}
            _hover={{
              color: `${activityColor}.600`
            }}
          >
            <ActivityIcon />
          </NavItemContents>
        </div>
      </PopoverTrigger>
      <PopoverContent mb={3} width='600px'>
        <PopoverHeader fontWeight='bold'>
          <>Activity</>
          <Badge fontSize='0.8em' ml={2}>
            {tasks.length}
          </Badge>
        </PopoverHeader>
        <PopoverCloseButton />
        <PopoverBody p={0}>
          <TaskList limit={3} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const isServer = typeof window === 'undefined'
const fn = () => {}
const addListener = isServer ? fn : window.addEventListener
const removeListener = isServer ? fn : window.removeEventListener

// TODO remove Sidebar redux dependency
const LogoSpinner = memo(() => {
  const [routeChanging] = useRouteChanging()
  const outstandingRequests = useSelector(selectOutstandingRequests)

  // Handle outstanding requests
  useEffect(() => {
    if (outstandingRequests) {
      const onBeforeUnload = (e) => {
        const returnValue = (e.returnValue = message('nav.unfinishedRequests'))
        return returnValue
      }

      addListener('beforeunload', onBeforeUnload)

      return () => removeListener('beforeunload', onBeforeUnload)
    }
  }, [outstandingRequests])

  if (outstandingRequests || routeChanging) {
    return <Spinner id='sidebar-spinner' />
  }

  return (
    <Box boxSize='21px'>
      <SVGLogo />
    </Box>
  )
})

type ExternalLinkProps = {
  children: React.ReactNode
  href: string
  label: string
}

const ExternalLink = memo<ExternalLinkProps>(({children, href, label}) => {
  return (
    <Tip label={label} placement='right'>
      <div>
        <a target='_blank' href={href} rel='noopener noreferrer'>
          <NavItemContents>{children}</NavItemContents>
        </a>
      </div>
    </Tip>
  )
})
