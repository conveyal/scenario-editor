const activeTask: CL.Task = {
  description: 'Update for an active task',
  id: '1',
  percentComplete: 50,
  state: 'ACTIVE',
  timeBegan: Date.now() - 60_000,
  timeCompleted: -1,
  title: 'Active task'
}

const erroredTask: CL.Task = {
  description: 'Error message from a task',
  id: '2',
  percentComplete: 75,
  state: 'ERROR',
  timeBegan: Date.now() - 60_000,
  timeCompleted: Date.now(),
  title: 'Errored Task',
  workProduct: {
    id: 'bundleId',
    type: 'bundle'
  }
}

const completedTask: CL.Task = {
  description: 'This is a log message',
  id: '3',
  percentComplete: 100,
  state: 'DONE',
  timeBegan: Date.now() - 60_000,
  timeCompleted: Date.now(),
  title: 'Completed task',
  workProduct: {
    id: 'bundleId',
    type: 'bundle'
  }
}

const completedTask2: CL.Task = {
  id: '4',
  title: 'Completed task 2',
  description: 'This is a description of a task.',
  percentComplete: 100,
  state: 'DONE',
  timeBegan: Date.now() - 60_000,
  timeCompleted: Date.now(),
  workProduct: {
    id: 'bundleId',
    type: 'bundle'
  }
}

const tasks: CL.Task[] = [
  activeTask,
  erroredTask,
  completedTask,
  completedTask2
]

export default tasks
