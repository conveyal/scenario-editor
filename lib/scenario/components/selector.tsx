import {Checkbox, Heading, Stack} from '@chakra-ui/react'
import {useEffect, useState} from 'react'

import {useScenarios, useScenariosModifications} from 'lib/hooks/use-collection'
import message from 'lib/message'

export default function ScenariosSelector({project, modification}) {
  const {data: scenarios} = useScenarios({query: {projectId: project._id}})
  const {
    create,
    data: scenariosModifications,
    remove
  } = useScenariosModifications({query: {modificationId: modification._id}})

  return (
    <Stack spacing={4}>
      <Heading size='md'>{message('scenario.activeIn')}</Heading>
      <Stack spacing={2}>
        {scenarios.map((s, i) => {
          const entry = scenariosModifications.find(
            (sm) => sm.scenarioId === s._id
          )
          return (
            <Entry
              create={() =>
                create({
                  modificationId: modification._id,
                  scenarioId: s._id
                })
              }
              entry={entry}
              index={i}
              key={s._id}
              remove={() => entry && remove(entry._id)}
              scenario={s}
            />
          )
        })}
      </Stack>
    </Stack>
  )
}

function Entry({
  create,
  entry,
  index,
  remove,
  scenario
}: {
  create: () => Promise<any>
  entry: CL.ScenariosModifications
  index: number
  remove: () => Promise<any>
  scenario: CL.Scenario
}) {
  const [checked, setChecked] = useState(!!entry)
  useEffect(() => {
    setChecked(!!entry)
  }, [entry, setChecked])
  return (
    <Checkbox
      fontWeight='normal'
      isChecked={checked}
      key={scenario._id}
      name={scenario.name}
      onChange={async (e) => {
        setChecked(e.target.checked)
        if (e.target.checked) {
          await create()
        } else {
          await remove()
        }
      }}
      value={scenario._id}
      wordBreak='break-all'
    >
      {index + 1}. {scenario.name}
    </Checkbox>
  )
}
