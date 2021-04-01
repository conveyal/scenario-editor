import authFetch from 'lib/utils/auth-fetch'
import {useCallback, useEffect, useState} from 'react'

import {API} from 'lib/constants'

import useStatus from './use-status'
import useUser from './use-user'

export default function useTaskUpdates(
  taskId: string
): [null | CL.Task, () => void] {
  const {data} = useStatus()
  const user = useUser()
  const [task, setTask] = useState<null | CL.Task>(null)

  useEffect(() => {
    setTask(data.taskProgress.find((t) => t.id === taskId))
  }, [data, taskId])

  const clearTask = useCallback(
    () => authFetch(`${API.Activity}/${taskId}`, user, {method: 'delete'}),
    [taskId, user]
  )

  return [task, clearTask]
}
