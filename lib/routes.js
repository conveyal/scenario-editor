// @flow
/**
 * React Router container to be rendered by woonerf/mount.
 * @author mattwigway
 */

import React from 'react'
import {IndexRoute, Router, Route} from 'react-router'

import Application from './containers/application'
import {authIsRequired, bootstrap, lock, logout} from './utils/auth0'
import EditBundle from './containers/edit-bundle'
import EditProject from './containers/edit-project'
import EditScenario from './containers/edit-scenario'
import NotFound from './components/404.js'
import ImportModifications from './containers/import-modifications'
import ImportShapefile from './containers/import-shapefile'
import Modifications from './containers/modifications'
import Project from './containers/project'
import Scenario from './containers/scenario'
import SelectProject from './containers/select-project'
import SelectScenario from './containers/select-scenario'
import SinglePointAnalysis from './containers/single-point-analysis'
import CreateGrid from './containers/create-grid'
import Report from './containers/report'
import Regional from './containers/regional-analysis-results'
import {setStore} from './utils/authenticated-fetch'

// initialize the application
export default function Routes ({history, store}: {
  history: History,
  store: Store
}) {
  setStore(store)
  authIsRequired && bootstrap(store)
  return <Router history={history}>
    <Route path='/reports/:projectId/scenarios/:scenarioId/variants/:variantId' component={Report} />
    <Route path='/login' onEnter={() => lock.show()} />
    <Route path='/logout' onEnter={logout} />
    <Route path='/' component={Application}>
      <IndexRoute component={SelectProject} />
      <Route path='projects/create' component={EditProject} />
      <Route path='projects/:projectId' component={Project}>
        <IndexRoute component={SelectScenario} />
        <Route path='bundles/create' component={EditBundle} />
        <Route path='bundles/:bundleId/edit' component={EditBundle} />
        <Route path='grids/create' component={CreateGrid} />
        <Route path='edit' component={EditProject} />
        <Route path='scenarios' component={SelectScenario} />
        <Route path='scenarios/create' component={EditScenario} />
      </Route>
      <Route path='scenarios/:scenarioId' component={Scenario}>
        <IndexRoute component={Modifications} />
        <Route path='edit' component={EditScenario} />
        <Route path='import-modifications' component={ImportModifications} />
        <Route path='import-shapefile' component={ImportShapefile} />
        <Route path='modifications/:modificationId' component={Modifications} />
        <Route path='analysis' component={SinglePointAnalysis} />
        <Route path='analysis/:variantId' component={SinglePointAnalysis} />
        <Route path='analysis/regional/:regionalAnalysisId' component={Regional} />
      </Route>
      <Route path='*' component={NotFound} />
    </Route>
    <Route path='*' component={NotFound} />
  </Router>
}
