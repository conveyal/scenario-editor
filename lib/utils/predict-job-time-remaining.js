import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import ms from 'ms'

// [job.id]: {time, averageMsPerTask}
const jobTimes = {}

// Default task time
const TIME_PER_TASK_MS = ms('1s')

/**
 * Store the last computed time and an average time per task for each job to
 * use for helping to predict the average time remaining.
 */
export default function predictTimeRemaining(id, complete, total, createdAt) {
  const time = Date.now()

  const remainingTasks = total - complete
  let msPerTask = (time - createdAt) / complete
  const previousRecord = jobTimes[id]
  if (previousRecord) {
    const completed = complete - previousRecord.complete
    const elapsedMs = time - previousRecord.time
    const currentMsPerTask = completed > 0 ? elapsedMs / completed : elapsedMs
    msPerTask = (previousRecord.msPerTask + currentMsPerTask) / 2
  }

  // Ensure no NaNs
  if (isNaN(msPerTask) || !isFinite(msPerTask)) msPerTask = TIME_PER_TASK_MS
  // Store record
  jobTimes[id] = {complete, msPerTask, time}

  const timeRemainingMs = msPerTask * remainingTasks
  return (
    formatDistanceToNow(new Date(Date.now() + timeRemainingMs)) + ' remaining'
  )
}
