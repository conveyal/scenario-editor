// @flow
import Icon from '@conveyal/woonerf/components/icon'
import Pure from '@conveyal/woonerf/components/pure'
import message from '@conveyal/woonerf/message'
import classnames from 'classnames'
import get from 'lodash/get'
import pathToRegex from 'path-to-regexp'
import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {sprintf} from 'sprintf-js'

import {CREATING_ID} from '../constants/region'
import * as select from '../selectors'
import Tip from './tip'

type Props = {
  currentPath: string,
  outstandingRequests: number,
  regionId?: string,
  projectId?: string,
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
  bundles: pathToRegex('/regions/:regionId/bundles'),
  bundleActions: pathToRegex('/regions/:regionId/bundles/:action'),
  editRegion: pathToRegex('/regions/:regionId/edit'),
  createOpportunityDataset: pathToRegex('/regions/:regionId/opportunities/:opportunitiesKey'),
  showOpportunityDatasets: pathToRegex('/regions/:regionId/opportunities'),
  projects: pathToRegex('/regions/:regionId'),
  createProject: pathToRegex('/regions/:regionId/projects/create'),
  editProjectSettings: pathToRegex('/projects/:projectId/edit'),
  editProject: pathToRegex('/projects/:projectId'),
  editModification: pathToRegex('/projects/:sid/modifications/:mid'),
  importModifications: pathToRegex(
    '/projects/:projectId/import-modifications'
  ),
  importShapefile: pathToRegex('/projects/:projectId/import-shapefile'),
  analyzeProject: pathToRegex('/projects/:projectId/analysis'),
  analyzeProjectVariant: pathToRegex(
    '/projects/:projectId/analysis/:variant'
  ),
  allRegionalAnalysis: pathToRegex('/projects/:projectId/regional'),
  regionalAnalysis: pathToRegex('/projects/:projectId/regional/:regionalId')
}

const isBundlePath = p => paths.bundles.exec(p) || paths.bundleActions.exec(p)

const isRegionPath = p =>
  paths.home.exec(p) ||
  paths.regions.exec(p) ||
  paths.projects.exec(p) ||
  paths.createProject.exec(p)

const isEditProjectPath = p =>
  paths.editProject.exec(p) ||
  paths.editProjectSettings.exec(p) ||
  paths.editModification.exec(p) ||
  paths.importModifications.exec(p) ||
  paths.importShapefile.exec(p)

const isRegionalPath = p =>
  paths.allRegionalAnalysis.exec(p) || paths.regionalAnalysis.exec(p)

const isAnalysisPath = p =>
  paths.analyzeProject.exec(p) || paths.analyzeProjectVariant.exec(p)

const isOpportunitiesPath = p =>
  paths.createOpportunityDataset.exec(p) || paths.showOpportunityDatasets.exec(p)

class Sidebar extends Pure {
  props: Props
  state: State

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
          </div>}

        {regionId &&
          projectId &&
          <div>
            <SidebarNavItem
              active={isEditProjectPath(currentPath)}
              icon='pencil'
              text={message('nav.editModifications')}
              href={`/projects/${projectId}`}
            />
            <SidebarNavItem
              active={isAnalysisPath(currentPath)}
              icon='area-chart'
              text={message('nav.analyze')}
              href={`/projects/${projectId}/analysis`}
            />
            <SidebarNavItem
              active={isRegionalPath(currentPath)}
              icon='server'
              text='Regional Analysis'
              href={`/projects/${projectId}/regional`}
            />
          </div>}

        <div className='Sidebar-bottom'>
          {username &&
            <SidebarNavItem
              icon='sign-out'
              text={`${message('authentication.logOut')} — ${sprintf(message('authentication.username'), username)}`}
              href='/logout'
            />}
          <SidebarNavItem
            icon='question-circle'
            text='Help and Documentation'
            href='http://docs.analysis.conveyal.com/'
          />

          {error &&
            <SidebarNavItem danger icon='exclamation-circle' text={error} />}

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
