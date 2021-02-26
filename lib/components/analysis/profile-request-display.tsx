import {Box, Button, PseudoBox, Stack, useDisclosure} from '@chakra-ui/core'
import {faChevronUp, faChevronDown} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import fpGet from 'lodash/fp/get'
import {useSelector} from 'react-redux'

import {secondsToHhMmString} from 'lib/utils/time'

import Icon from '../icon'
import {ALink} from '../link'
import Tip from '../tip'

import ModeSummary from './mode-summary'

// Minimal selectors for projects and bundles
const selectProjects = fpGet('project.projects')
const selectBundles = fpGet('region.bundles')

const stringifyIfObject = (o: any) =>
  typeof o === 'object'
    ? JSON.stringify(o, null, ' ')
    : o.toString
    ? o.toString()
    : o

const TDTitle = ({children}) => (
  <Box
    as='td'
    overflow='hidden'
    fontWeight={600}
    px={4}
    py={2}
    style={{
      textOverflow: 'ellipsis'
    }}
    textAlign='right'
    title={typeof children === 'string' ? children : undefined}
    width='35%'
  >
    {children}
  </Box>
)

const TDValue = ({children}) => (
  <Box as='td' width='65%'>
    {children}
  </Box>
)

const PROJECT_CHANGE_NOTE =
  'Notice: project may have changed since the analysis was run.'

/** Display the parameters of a profile request */
export default function ProfileRequestDisplay({
  bundleId,
  color = 'blue',
  profileRequest,
  projectId
}) {
  const projects = useSelector(selectProjects)
  const bundles = useSelector(selectBundles)

  const {onToggle, isOpen} = useDisclosure()

  const project = projects.find((p) => p._id === projectId)
  const bundle = bundles.find((b) => b._id === bundleId)

  const scenarioName =
    profileRequest.variant > -1
      ? get(project, `variants[${profileRequest.variant}]`, 'Unknown')
      : 'Baseline'

  return (
    <Stack>
      <Box
        as='table'
        style={{
          tableLayout: 'fixed'
        }}
        width='100%'
      >
        <tbody>
          {bundle && (
            <tr>
              <TDTitle>Bundle</TDTitle>
              <TDValue>
                <ALink
                  to='bundleEdit'
                  bundleId={bundle._id}
                  regionId={bundle.regionId}
                >
                  {bundle.name}
                </ALink>
              </TDValue>
            </tr>
          )}
          {project && (
            <tr>
              <TDTitle>Project</TDTitle>
              <TDValue>
                <Tip label={PROJECT_CHANGE_NOTE}>
                  <div>
                    <ALink
                      to='modifications'
                      projectId={project._id}
                      regionId={project.regionId}
                    >
                      {project.name}
                    </ALink>
                  </div>
                </Tip>
              </TDValue>
            </tr>
          )}
          <tr>
            <TDTitle>Scenario</TDTitle>
            <TDValue>{scenarioName}</TDValue>
          </tr>
          <tr>
            <TDTitle>Service Date</TDTitle>
            <TDValue>{profileRequest.date}</TDValue>
          </tr>
          <tr>
            <TDTitle>Service Time</TDTitle>
            <TDValue>
              {secondsToHhMmString(profileRequest.fromTime)}-
              {secondsToHhMmString(profileRequest.toTime)}
            </TDValue>
          </tr>
          <tr>
            <TDTitle>Modes</TDTitle>
            <TDValue>
              <ModeSummary
                accessModes={profileRequest.accessModes}
                color={color}
                egressModes={profileRequest.egressModes}
                transitModes={profileRequest.transitModes}
              />
            </TDValue>
          </tr>
          <tr>
            <td colSpan={2}></td>
          </tr>
        </tbody>
      </Box>

      <Box borderBottom='1px solid #E2E8F0'>
        <Button
          borderRadius='0'
          _focus={{
            outline: 'none'
          }}
          onClick={onToggle}
          size='sm'
          title={isOpen ? 'collapse' : 'expand'}
          variant='ghost'
          variantColor={color}
          width='100%'
        >
          <Icon icon={isOpen ? faChevronUp : faChevronDown} />
        </Button>
        {isOpen && <ObjectToTable color={color} object={profileRequest} />}
      </Box>
    </Stack>
  )
}

export function ObjectToTable({color = 'blue', object}) {
  const keys = Object.keys(object)
  keys.sort()
  return (
    <Box
      as='table'
      fontFamily='mono'
      fontSize='sm'
      style={{
        tableLayout: 'fixed'
      }}
      width='100%'
    >
      <tbody>
        {keys.map((k) => (
          <PseudoBox
            as='tr'
            key={k}
            _odd={{
              bg: `${color}.50`
            }}
          >
            <TDTitle>{k}</TDTitle>
            <TDValue>
              <Box
                as='pre'
                bg='transparent'
                border='none'
                overflowX='auto'
                pr={3}
                py={2}
              >
                {stringifyIfObject(object[k])}
              </Box>
            </TDValue>
          </PseudoBox>
        ))}
      </tbody>
    </Box>
  )
}
