import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import memoize from 'lodash/memoize'
import ms from 'ms'
import {createSelector} from 'reselect'

// [job.id]: {time, averageMsPerTask}
const jobTimes = {}

// Default task time
const TIME_PER_TASK_MS = ms('1s')

// Memoize time prediction
const memoizedPredictTimeRemaining = memoize(predictTimeRemaining, (...args) =>
  args.join('-')
)

export default createSelector(
  state => state.regionalAnalyses.activeJobs,
  jobs =>
    jobs.map(j => ({
      ...j,
      timeRemaining: memoizedPredictTimeRemaining(
        j.jobId,
        j.complete,
        j.total,
        j.regionalAnalysis.createdAt
      )
    }))
)

function predictTimeRemaining(id, complete, total, createdAt) {
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
