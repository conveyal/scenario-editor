import {loadProjectAndModifications} from 'lib/actions/project'
import Report from 'lib/components/report'
import withAuth from 'lib/with-auth'
import withInitialFetch from 'lib/with-initial-fetch'
import withRedux from 'lib/with-redux'

const ReportPage = withInitialFetch(Report, async (dispatch, query) => {
  const {projectId, index} = query
  const {bundle, feeds, modifications, project} = await dispatch(
    loadProjectAndModifications(projectId)
  )

  return {
    bundle,
    feeds,
    modifications: modifications.filter((m) => m.variants[index]),
    project,
    variant: project.variants[index]
  }
})

export default withAuth(withRedux(ReportPage))
