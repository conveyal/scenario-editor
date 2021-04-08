import tasks from './tasks'

const activity: CL.Activity = {
  systemStatusMessages: [],
  taskBacklog: tasks.length,
  taskProgress: tasks
}

export default activity
