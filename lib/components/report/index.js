import {Box, Divider, Heading, Stack} from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import React from 'react'
import {useSelector} from 'react-redux'

import message from 'lib/message'
import selectFeedsById from 'lib/selectors/feeds-by-id'
import selectFeedScopedStops from 'lib/selectors/feed-scoped-stops'
import selectProjectTimetables from 'lib/selectors/project-timetables'

const ModificationReport = dynamic(() => import('./modification'), {ssr: false})
const attribution = '© Mapbox © OpenStreetMap'

/**
 * Main report generation component
 */
export function Report(p) {
  return (
    <Stack margin='0 auto' maxWidth='720px' spacing={8}>
      <style jsx global>{`
        table {
          border-collapse: collapse;
          text-align: left;
        }

        td,
        th {
          text-align: left;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.5rem;
        }

        td {
          vertical-align: top;
        }

        th {
          white-space: nowrap;
        }
      `}</style>

      <Stack spacing={2}>
        <Heading>{p.project.name}</Heading>
        <Heading size='md'>
          {message('report.variant', {variant: p.variant})}
        </Heading>
        <Heading size='sm'>
          {message('report.bundle', {name: p.bundle.name})}
        </Heading>
      </Stack>

      <Divider />

      {p.modifications.map((m, index) => (
        <Box key={m._id}>
          <ModificationReport
            modification={m}
            feedsById={p.feedsById}
            projectTimetables={p.projectTimetables}
            feedScopedStops={p.feedScopedStops}
            index={index + 1} // correct for 0-based array indices
            total={p.modifications.length}
          />
        </Box>
      ))}

      <Box textAlign='center'>Map data: {attribution}</Box>
    </Stack>
  )
}

export default function WrappedReport(p) {
  const feedsById = useSelector(selectFeedsById)
  const feedScopedStops = useSelector(selectFeedScopedStops)
  const projectTimetables = useSelector(selectProjectTimetables)

  return (
    <Report
      {...p}
      feedsById={feedsById}
      feedScopedStops={feedScopedStops}
      projectTimetables={projectTimetables}
    />
  )
}
