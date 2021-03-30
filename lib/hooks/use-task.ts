import {useEffect, useState} from 'react'

import useStatus from './use-status'

type FilterFn = (tasks: CL.Task[]) => void | CL.Task

export default function useStatusMessage(filter: FilterFn): void | CL.Task {
  const {data} = useStatus()
  const [task, setTask] = useState<void | CL.Task>()

  useEffect(() => {
    setTask(filter(data.taskProgress))
  }, [data, filter])

  return task
}
