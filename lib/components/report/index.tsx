import {Box, Divider, Heading, Stack} from '@chakra-ui/react'
import dynamic from 'next/dynamic'

import {useBundle} from 'lib/hooks/use-model'
import useModificationsForScenario from 'lib/modification/hooks/use-modifications-for-scenario'
import message from 'lib/message'

const ModificationReport = dynamic(() => import('./modification'), {ssr: false})
const attribution = '© Mapbox © OpenStreetMap'

/**
 * Main report generation component
 */
export default function Report(p: {
  project: CL.Project
  scenario: CL.Scenario
}) {
  const {data: bundle} = useBundle(p.project._id)
  const modifications = useModificationsForScenario(p.scenario._id)
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
          {message('report.scenario', {scenario: p.scenario.name})}
        </Heading>
        <Heading size='sm'>
          {message('report.bundle', {name: bundle?.name})}
        </Heading>
      </Stack>

      <Divider />

      {modifications.map((m, index) => (
        <Box key={m._id}>
          <ModificationReport
            bundle={bundle}
            modification={m}
            index={index + 1} // correct for 0-based array indices
            total={modifications.length}
          />
        </Box>
      ))}

      <Box textAlign='center'>Map data: {attribution}</Box>
    </Stack>
  )
}
