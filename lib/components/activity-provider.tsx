import {ActivityContext, useActivitySync} from 'lib/hooks/use-activity'

export default function ActivityProvider({children}) {
  return (
    <ActivityContext.Provider value={useActivitySync()}>
      {children}
    </ActivityContext.Provider>
  )
}
