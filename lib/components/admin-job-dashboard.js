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
  Stack,
  Stat,
  StatHelpText,
  StatGroup,
  StatLabel,
  StatNumber,
  Text
} from '@chakra-ui/react'
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import React from 'react'

import Link, {ExternalLink} from 'lib/components/text-link'
import WorkerBolts from 'lib/components/worker-bolts'

import Worker from './admin-worker'

const START_TIME_FORMAT = 'MM-dd HH:mm:ss'

const formatStartTime = (ms) => format(ms, START_TIME_FORMAT)
const percentComplete = (j) => Math.floor((j.complete / j.total) * 100)
const estimatedTimeRemainingMS = (j) => {
  const elapsedMS = Date.now() - j.createdAt
  // completedTasks / totalTasks = elapsedMS / totalMS
  const timeRemainingMS = (j.total * elapsedMS) / j.complete
  return timeRemainingMS
}

const add0 = (n) => (n >= 10 ? n : `0${n}`)
function msToDuration(ms) {
  const durationS = Math.floor((Date.now() - ms) / 1000)
  const s = durationS % 60
  const m = Math.floor((durationS / 60) % 60)
  const h = Math.floor((durationS / 60 / 60) % 60)

  return `${add0(h)}:${add0(m)}:${add0(s)}`
}

const timeRemainingInWords = (p) => {
  const ms = estimatedTimeRemainingMS(p)
  if (isNaN(ms) || !isFinite(ms)) return ''
  try {
    return formatDistanceToNow(new Date(Date.now() + ms)) + ' remaining'
  } catch (e) {
    console.error(e)
    return ''
  }
}

/**
 * Example commit string: "v3.4.0-118-gbe7199c". Take the last section after
 * splitting on the hyphens and remove the "g".
 */
const githubUrl = 'https://github.com/conveyal/r5/commits'
function createR5Url(workerCommit) {
  // not a release version
  if (workerCommit.indexOf('-') !== -1) {
    const hash = workerCommit.split('-')[2].slice(1) //
    return `${githubUrl}/${hash}`
  }
  return `${githubUrl}/${workerCommit}`
}

export default function JobDashboard(p) {
  return p.jobs.length === 0 ? (
    <Box textAlign='center' mt='5'>
      <em>no active jobs</em>
    </Box>
  ) : (
    <Accordion allowMultiple allowToggle>
      {p.jobs.map((j) => (
        <Job
          key={j.jobId}
          {...j.regionalAnalysis}
          {...j}
          workers={p.workers.filter(
            (w) => w.scenarios[0] === j.regionalAnalysis.request.jobId
          )}
        />
      ))}
    </Accordion>
  )
}

function Job(p) {
  const active = p.activeWorkers > 0
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
        <Badge ml='5' fontSize='md' colorScheme='blue'>
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
        <WorkerBolts ml='5' workerCount={p.activeWorkers} />
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
                <StatLabel>Created at</StatLabel>
                <StatNumber>{formatStartTime(p.createdAt)}</StatNumber>
                <StatHelpText>{msToDuration(p.createdAt)}</StatHelpText>
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
                <StatNumber>{p.workerVersion}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>User</StatLabel>
                <StatNumber>{p.createdBy}</StatNumber>
              </Stat>
            </StatGroup>
          </Stack>
          <Stack textAlign='right'>
            <Text fontWeight='bold'>LINKS</Text>
            <Link href={`/regions/${p.regionId}/regional?analysisId=${p._id}`}>
              Results
            </Link>
            <Link href={`/regions/${p.regionId}/bundles/${p.bundleId}`}>
              Bundle
            </Link>
            <Link href={`/regions/${p.regionId}/projects/${p.projectId}`}>
              Project
            </Link>
            <ExternalLink href={createR5Url(p.workerCommit)}>
              R5 {p.workerVersion}
            </ExternalLink>
          </Stack>
        </Stack>
        <Flex ml='8' mt='4' wrap='wrap'>
          {p.workers.map((w) => (
            <Box key={w.workerId} mr='2' mb='2'>
              <Worker {...w} />
            </Box>
          ))}
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  )
}
