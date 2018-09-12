// @flow
/**
 * React Router container to be rendered by woonerf/mount.
 * @author mattwigway
 */
import React from 'react'
import ReactGA from 'react-ga'
import {IndexRoute, Router, Route} from 'react-router'

import {load as loadProject} from './actions/project'
import {load as loadRegion} from './actions/region'
import Admin from './modules/admin'
import * as auth0 from './utils/auth0'
import Bundles from './components/bundles'
import CreateBundle from './containers/create-bundle'
import CreateProject from './containers/create-project'
import CreateRegion from './containers/create-region'
import EditBundle from './containers/edit-bundle'
import EditRegion from './containers/edit-region'
import EditProject from './containers/edit-project'
import NotFound from './components/404.js'
import ImportModifications from './containers/import-modifications'
import ImportShapefile from './containers/import-shapefile'
import ModificationEditor from './containers/modification-editor'
import Modifications from './containers/modifications'
import SelectRegion from './containers/select-region'
import SelectProject from './containers/select-project'
import SinglePointAnalysis from './containers/single-point-analysis'
import OpportunityDatasets from './modules/opportunity-datasets'
import Report from './containers/report'
import RegionalResultsList from './containers/regional-results-list'
import Regional from './containers/regional-analysis-results'
import * as select from './selectors'

let logPageView = function () {}
if (process.env.NODE_ENV !== 'test') {
  // Initialize Google Analytics
  ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID || 'UA-000000-01', {
    debug: process.env.NODE_ENV !== 'production'
  })

  // Longhand function style to pick up `this` from Router
  logPageView = function () {
    ReactGA.pageview(this.state.location.pathname)
  }
}

type Props = {
  store: any
}

// initialize the application
export default class Routes extends React.Component<Props, State> {
  // Default redirect to base url (in case a user goes directly to `/login`)
  _redirectTo = '/'

  constructor (props: Props) {
    super(props)
    // allow the store to be accessible from the command line
    if (window) window.store = props.store

    window.select = {}
    Object.keys(select).forEach(key => {
      window.select[key] = () => select[key](props.store.getState())
    })
  }

  _checkAuthentication = (nextState: any) => {
    const user = this.props.store.getState().user
    if (auth0.authIsRequired && !user) {
      this._redirectTo = `${nextState.location.pathname}${nextState.location.search}`
      this.props.history.push('/login')
    }
  }

  _login = () => {
    // Login with Auth0 and get the user data.
    auth0.login((user) => {
      // Register to Google Analytics
      ReactGA.set({
        accessGroup: user.analyst.group,
        email: user.email
      })

      // set in the store
      this.props.store.dispatch({
        type: 'set user',
        payload: user
      })

      // redirect back
      this.props.history.push(this._redirectTo)
    })
  }

  _loadRegion = (nextState: any, _: any, callback: Function) => {
    this.props.store.dispatch(loadRegion(nextState.params.regionId, callback))
  }

  _loadProject = (nextState: any, _: any, callback: Function) => {
    this.props.store.dispatch(loadProject(nextState.params.projectId, callback))
  }

  _logout = () => {
    this.props.store.dispatch({
      type: 'set user',
      payload: null
    })
    auth0.logout()
  }

  _redirectHome = () => {
    setTimeout(() => {
      this.props.history.push('/')
    }, 3000)
  }

  render () {
    // Mount the routes
    return (
      <Router
        history={this.props.history}
        onUpdate={logPageView}>

        <Route path='/login' onEnter={this._login} />
        <Route path='/logout' onEnter={this._logout} />
        <Route path='/' onEnter={this._checkAuthentication}>
          <IndexRoute component={SelectRegion} />
          <Route path='regions' component={SelectRegion} />
          <Route
            path='reports/:regionId/projects/:projectId/variants/:variantId'
            component={Report}
          />
          <Route path='admin' component={Admin.components.MainDashboard} />
          <Route path='admin/jobs' component={Admin.components.JobDashboard} />
          <Route path='admin/workers' component={Admin.components.WorkerDashboard} />
          <Route path='regions/create' component={CreateRegion} />

          <Route
            onEnter={this._loadRegion}
            path='regions/:regionId'
          >
            <IndexRoute component={SelectProject} />
            <Route
              path='analysis'
              component={SinglePointAnalysis}
            />
            <Route path='regional' component={RegionalResultsList} />
            <Route
              path='regional/:regionalAnalysisId'
              component={Regional}
            />
            <Route path='projects' component={SelectProject} />
            <Route path='bundles' component={Bundles}>
              <IndexRoute component={EditBundle} />
              <Route path='create' component={CreateBundle} />
              <Route path=':bundleId' component={EditBundle} />
            </Route>
            <Route
              component={OpportunityDatasets.components.Heading}
              path='opportunities'
            >
              <IndexRoute component={OpportunityDatasets.components.List} />
              <Route
                path='upload'
                component={OpportunityDatasets.components.Upload}
              />
            </Route>
            <Route path='edit' component={EditRegion} />
            <Route path='projects' component={SelectProject} />
            <Route path='create-project' component={CreateProject} />
            <Route
              onEnter={this._loadProject}
              path='projects/:projectId'
            >
              <IndexRoute component={Modifications} />
              <Route path='edit' component={EditProject} />
              <Route path='import-modifications' component={ImportModifications} />
              <Route path='import-shapefile' component={ImportShapefile} />
              <Route path='modifications' component={Modifications} />
              <Route
                path='modifications/:modificationId'
                component={ModificationEditor}
              />
            </Route>
          </Route>
        </Route>
        <Route path='*' component={NotFound} onEnter={this._redirectHome} />
      </Router>
    )
  }
}
