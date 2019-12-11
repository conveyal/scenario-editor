import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Box,
  Flex,
  Progress,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverTrigger,
  PopoverContent,
  Stack,
  Stat,
  StatHelpText,
  StatGroup,
  StatLabel,
  StatNumber,
  Tag,
  Text
} from '@chakra-ui/core'
import {faBolt, faExternalLinkAlt} from '@fortawesome/free-solid-svg-icons'
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import React from 'react'

import useSWR from 'lib/auth-swr'
import Icon from 'lib/components/icon'

import {REFRESH_INTERVAL_MS, START_TIME_FORMAT} from '../constants'
import * as utils from '../utils'

import testJobs from '../jobs.json'

import Link from './link'

const formatStartTime = ms => format(ms, START_TIME_FORMAT)
const percentComplete = j => Math.floor((j.complete / j.total) * 100)
const estimatedTimeRemainingMS = j => {
  const elapsedMS = Date.now() - j.createdAt
  // completedTasks / totalTasks = elapsedMS / totalMS
  const timeRemainingMS = (j.total * elapsedMS) / j.complete
  return timeRemainingMS
}

const timeRemainingInWords = p => {
  const ms = estimatedTimeRemainingMS(p)
  if (isNaN(ms)) return ''
  try {
    return formatDistanceToNow(new Date(Date.now() + ms)) + ' remaining'
  } catch (e) {
    console.error(e)
    return ''
  }
}

const ExA = ({children, href}) => (
  <a href={href} target='_blank' rel='noopener noreferrer'>
    {children}
  </a>
)

function Worker(p) {
  return (
    <Popover trigger='hover'>
      <PopoverTrigger>
        <Tag rounded='full' variantColor='green'>
          <Icon icon={faBolt} />
        </Tag>
      </PopoverTrigger>
      <PopoverContent zIndex={4}>
        <PopoverArrow />
        <PopoverHeader>
          <ExA href={utils.createWorkerUrl(p.ec2instanceId, p.ec2region)}>
            Inspect EC2 Instance in AWS <Icon icon={faExternalLinkAlt} />
          </ExA>
        </PopoverHeader>
        <PopoverBody>
          <Stack spacing='1'>
            {Object.keys(p)
              .filter(k => typeof p[k] === 'string')
              .map(k => (
                <Flex justify='space-between' key={k} isTruncated>
                  <Text mr='2'>{k}</Text>
                  <Text fontWeight='bold' title={p[k]} isTruncated>
                    {p[k]}
                  </Text>
                </Flex>
              ))}
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default function JobDashboard() {
  const {data: jobs} = useSWR(
    {url: '/jobs'},
    {refreshInterval: REFRESH_INTERVAL_MS}
  )
  const {data: workers} = useSWR(
    {url: '/workers'},
    {refreshInterval: REFRESH_INTERVAL_MS}
  )
  const filteredJobs = (jobs || []).filter(j => j.graphId !== 'SUM')

  return (
    <Stack spacing='8'>
      {filteredJobs.length === 0 ? (
        <Text as='em' textAlign='center'>
          no active jobs
        </Text>
      ) : (
        <Accordion allowMultiple allowToggle>
          {[...filteredJobs, testJobs[0]].map(j => (
            <Job
              key={j.jobId}
              {...j.regionalAnalysis}
              {...j}
              workers={workers.filter(
                w => w.scenarios[0] === j.regionalAnalysis.request.jobId
              )}
            />
          ))}
        </Accordion>
      )}
      {workers.length === 0 ? (
        <Text as='em' textAlign='center'>
          no active workers
        </Text>
      ) : (
        <Flex justify='center'>
          {workers.map(w => (
            <Box key={w.workerId} mr='2'>
              <Worker {...w} />
            </Box>
          ))}
        </Flex>
      )}
    </Stack>
  )
}

function Job(p) {
  const active = p.workers.length > 0
  const color = active ? 'green' : 'yellow'
  return (
    <AccordionItem>
      <AccordionHeader>
        <Box
          borderRadius='10px'
          borderWidth='5px'
          borderColor={`${color}.500`}
        />
        <Text ml='5' fontSize='lg' isTruncated maxWidth='300px'>
          {p.name}
        </Text>
        <Badge ml='5' fontSize='md' variantColor='blue'>
          {p.accessGroup}
        </Badge>
        <Box flex='1' ml='5'>
          <Progress
            value={percentComplete(p)}
            color={color}
            hasStripe
            isAnimated
          />
        </Box>
        <Tag ml='5' size='md' rounded='full' variantColor={color}>
          <Icon icon={faBolt} /> {p.workers.length}
        </Tag>
        <Text fontSize='lg' mx='5'>
          {timeRemainingInWords(p)}
        </Text>
        <AccordionIcon />
      </AccordionHeader>
      <AccordionPanel>
        <Stack isInline spacing='8' ml='8' mt='2'>
          <Stack flex='1'>
            <StatGroup>
              <Stat>
                <StatLabel>Start</StatLabel>
                <StatNumber>{formatStartTime(p.createdAt)}</StatNumber>
                <StatHelpText>{utils.msToDuration(p.createdAt)}</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Tasks</StatLabel>
                <StatNumber>
                  {p.complete} / {p.total}
                </StatNumber>
                <StatHelpText>{percentComplete(p)}%</StatHelpText>
              </Stat>
            </StatGroup>
            <StatGroup>
              <Stat>
                <StatLabel>R5</StatLabel>
                <StatNumber>
                  <ExA href={utils.createR5Url(p.workerCommit)}>
                    {p.workerVersion}
                  </ExA>
                </StatNumber>
              </Stat>
              <Stat>
                <StatLabel>User</StatLabel>
                <StatNumber>{p.createdBy}</StatNumber>
              </Stat>
            </StatGroup>
          </Stack>
          <Stack textAlign='right'>
            <Text fontWeight='bold'>LINKS</Text>
            <Link to={`/regions/${p.regionId}/regional?analysisId=${p._id}`}>
              Results
            </Link>
            <Link to={`/regions/${p.regionId}/bundles/${p.bundleId}`}>
              Bundle
            </Link>
            <Link to={`/regions/${p.regionId}/projects/${p.projectId}`}>
              Project
            </Link>
          </Stack>
        </Stack>
        <Flex ml='8' mt='4'>
          {p.workers.map(w => (
            <Box key={w.workerId} mr='2'>
              <Worker {...w} />
            </Box>
          ))}
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  )
}
