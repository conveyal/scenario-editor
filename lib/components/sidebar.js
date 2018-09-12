// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import classnames from 'classnames'
import get from 'lodash/get'
import pathToRegex from 'path-to-regexp'
import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import {CREATING_ID} from '../constants/region'
import * as select from '../selectors'

import Tip from './tip'

type Props = {
  currentPath: string,
  outstandingRequests: number,
  projectId?: string,
  regionId?: string,
  username?: string
}

type State = {
  error: null | string,
  online: boolean
}

function mapStateToProps (state, ownProps) {
  return {
    currentPath: window.location.pathname,
    outstandingRequests: state.network.outstandingRequests,
    projectId: select.currentProjectId(state, ownProps),
    regionId: select.currentRegionId(state, ownProps),
    username: get(state, 'user.name')
  }
}

const paths = {
  home: pathToRegex('/'),
  regions: pathToRegex('/regions'),
  region: pathToRegex('/regions/:regionId'),
  bundles: pathToRegex('/regions/:regionId/bundles'),
  bundleActions: pathToRegex('/regions/:regionId/bundles/:action'),
  editRegion: pathToRegex('/regions/:regionId/edit'),
  createOpportunityDataset: pathToRegex('/regions/:regionId/opportunities/:opportunitiesKey'),
  showOpportunityDatasets: pathToRegex('/regions/:regionId/opportunities'),
  projects: pathToRegex('/regions/:regionId/projects'),
  createProject: pathToRegex('/regions/:regionId/create-project'),
  analyzeRegion: pathToRegex('/regions/:regionId/analysis'),
  allRegionalAnalyses: pathToRegex('/regions/:regionId/regional'),
  regionalAnalysis: pathToRegex('/regions/:regionId/regional/:regionalId'),
  editProjectSettings: pathToRegex('/regions/:regionId/projects/:projectId/edit'),
  editProject: pathToRegex('/regions/:regionId/projects/:projectId'),
  editModification: pathToRegex('/regions/:regionId/projects/:sid/modifications/:mid'),
  importModifications: pathToRegex(
    '/regions/:regionId/projects/:projectId/import-modifications'
  ),
  importShapefile: pathToRegex('/regions/:regionId/projects/:projectId/import-shapefile')
}

const isBundlePath = p => paths.bundles.exec(p) || paths.bundleActions.exec(p)

const isRegionPath = p =>
  paths.home.exec(p) ||
  paths.regions.exec(p) ||
  paths.region.exec(p) ||
  paths.createProject.exec(p)

const isEditProjectPath = p =>
  paths.projects.exec(p) ||
  paths.editProject.exec(p) ||
  paths.editProjectSettings.exec(p) ||
  paths.editModification.exec(p) ||
  paths.importModifications.exec(p) ||
  paths.importShapefile.exec(p)

const isRegionalPath = p =>
  paths.allRegionalAnalyses.exec(p) || paths.regionalAnalysis.exec(p)

const isAnalysisPath = p =>
  paths.analyzeRegion.exec(p)

const isOpportunitiesPath = p =>
  paths.createOpportunityDataset.exec(p) || paths.showOpportunityDatasets.exec(p)

class Sidebar extends React.Component<Props, State> {
  state = {
    error: null,
    online: navigator.onLine
  }

  componentDidMount () {
    // TODO: Check to see if it can communicate with the backend, not just the internet (for local development)
    window.addEventListener('online', this._onOnline)
    window.addEventListener('offline', this._onOffline)
    window.addEventListener('beforeunload', this._onBeforeUnload)
    window.addEventListener('error', this._onError)
    window.addEventListener('unhandledrejection', this._onUnhandledRejection)
  }

  componentWillUnmount () {
    window.removeEventListener('online', this._onOnline)
    window.removeEventListener('offline', this._onOffline)
    window.removeEventListener('beforeunload', this._onBeforeUnload)
    window.removeEventListener('error', this._onError)
    window.removeEventListener('unhandledrejection', this._onUnhandledRejection)
  }

  _onBeforeUnload = e => {
    if (this.props.outstandingRequests > 0) {
      const returnValue = (e.returnValue = message('nav.unfinishedRequests'))
      return returnValue
    }
  }

  _onError = error => this.setState({error: error.message})
  _onOnline = () => this.setState({online: true})
  _onOffline = () => this.setState({online: false})
  _onUnhandledRejection = error => this.setState({error: error.reason.stack})

  render () {
    const {
      currentPath,
      outstandingRequests,
      regionId,
      projectId,
      username
    } = this.props
    const {error, online} = this.state
    return (
      <div className='Sidebar'>
        {outstandingRequests > 0
          ? <div className='Sidebar-spinner'>
            <Icon type='spinner' className='fa-spin' />
          </div>
          : <div
            className='Sidebar-logo'
          />}

        <SidebarNavItem
          icon='globe'
          text={message('nav.regions')}
          href='/'
        />
        {regionId && regionId !== CREATING_ID &&
          <div>
            <SidebarNavItem
              active={paths.editRegion.exec(currentPath)}
              icon='map-o'
              text={message('nav.regionSettings')}
              href={`/regions/${regionId}/edit`}
            />
            <SidebarNavItem
              active={isRegionPath(currentPath)}
              icon='cubes'
              text={message('nav.projects')}
              href={`/regions/${regionId}`}
            />
            <SidebarNavItem
              active={isBundlePath(currentPath)}
              icon='database'
              text={message('nav.gtfsBundles')}
              href={`/regions/${regionId}/bundles`}
            />
            <SidebarNavItem
              active={isOpportunitiesPath(currentPath)}
              icon='th'
              text={message('nav.opportunityDatasets')}
              href={`/regions/${regionId}/opportunities`}
            />
            {projectId
              ? <SidebarNavItem
                active={isEditProjectPath(currentPath)}
                icon='pencil'
                text={message('nav.editModifications')}
                href={`/regions/${regionId}/projects/${projectId}`}
              />
              : <SidebarNavItem
                active={isEditProjectPath(currentPath)}
                icon='pencil'
                text={message('nav.editModifications')}
                href={`/regions/${regionId}/projects`}
              />}
            <SidebarNavItem
              active={isAnalysisPath(currentPath)}
              icon='area-chart'
              text={message('nav.analyze')}
              href={`/regions/${regionId}/analysis`}
            />
            <SidebarNavItem
              active={isRegionalPath(currentPath)}
              icon='server'
              text='Regional Analysis'
              href={`/regions/${regionId}/regional`}
            />
          </div>}

        <div className='Sidebar-bottom'>
          {username &&
            <SidebarNavItem
              icon='sign-out'
              text={`${message('authentication.logOut')} — ${message('authentication.username', {username})}`}
              href='/logout'
            />}
          <SidebarNavItem
            icon='question-circle'
            text={message('nav.help')}
            href='http://docs.analysis.conveyal.com/'
          />

          {error &&
            <SidebarNavItem danger icon='exclamation-circle' text={message('error.script') + error} />}

          {!online &&
            <SidebarNavItem
              danger
              icon='wifi'
              text={message('nav.notConnectedToInternet')}
            />}
        </div>
      </div>
    )
  }
}

function SidebarNavItem ({active, icon, href, text, ...props}) {
  const className = classnames('Sidebar-navItem', {active, ...props})
  const isAbsoluteUrl = href && href.startsWith('http')
  return (
    <Tip
      className={className}
      tip={text}
    >
      {href &&
        !isAbsoluteUrl &&
        <Link to={href} className='Sidebar-navItem-contents'>
          <ItemContents icon={icon} text={text} />
        </Link>}
      {href &&
        isAbsoluteUrl &&
        <a href={href} target='_blank' className='Sidebar-navItem-contents'>
          <ItemContents icon={icon} text={text} />
        </a>}
      {!href &&
        <span className='Sidebar-navItem-contents'>
          <ItemContents icon={icon} text={text} />
        </span>}
    </Tip>
  )
}

const ItemContents = ({icon, text}) => (
  <span>
    <Icon type={icon} />
    <span className='Sidebar-navItem-text'>
      {' '}{text}
    </span>
  </span>
)

export default connect(mapStateToProps)(Sidebar)
