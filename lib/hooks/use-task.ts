import authFetch from 'lib/utils/auth-fetch'
import {useCallback, useEffect, useState} from 'react'

import {API} from 'lib/constants'

import useStatus from './use-status'
import useUser from './use-user'

type FilterFn = (tasks: CL.Task[]) => null | CL.Task

export default function useStatusMessage(
  filter: FilterFn
): [null | CL.Task, () => void] {
  const {data} = useStatus()
  const user = useUser()
  const [task, setTask] = useState<null | CL.Task>(null)
  const taskId = task?.id

  useEffect(() => {
    setTask(filter(data.taskProgress))
  }, [data, filter])

  const clearTask = useCallback(
    () => authFetch(`${API.Activity}/${taskId}`, user, {method: 'delete'}),
    [taskId, user]
  )

  return [task, clearTask]
}
