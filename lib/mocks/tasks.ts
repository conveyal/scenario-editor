const activeTask: CL.Task = {
  detail: 'Update for an active task',
  id: '1',
  percentComplete: 50,
  state: 'ACTIVE',
  secondsActive: 60,
  secondsComplete: 0,
  title: 'Active task'
}

const erroredTask: CL.Task = {
  ...activeTask,
  detail: 'Error message from a task',
  id: '2',
  state: 'ERROR',
  secondsActive: 30,
  secondsComplete: 0,
  title: 'Errored Task',
  workProduct: {
    id: 'bundleId',
    regionId: 'regionId',
    type: 'BUNDLE'
  }
}

const completedTask: CL.Task = {
  ...erroredTask,
  detail: 'This is a log message',
  id: '3',
  percentComplete: 100,
  state: 'DONE',
  title: 'Completed task'
}

const completedTask2: CL.Task = {
  ...completedTask,
  id: '4',
  title: 'Completed task 2'
}

const tasks: CL.Task[] = [
  activeTask,
  erroredTask,
  completedTask,
  completedTask2
]

export default tasks
