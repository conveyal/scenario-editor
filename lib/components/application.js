// @flow
import lonlat from '@conveyal/lonlat'
import {Browser, LatLngBounds} from 'leaflet'
import React, {Component} from 'react'
import {Map as LeafletMap, TileLayer} from 'react-leaflet'

import {
  DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT,
  EDIT_PROJECT_BOUNDS_COMPONENT,
  EDIT_REGIONAL_ANALYSIS_BOUNDS_COMPONENT,
  BUNDLE_PREVIEW_COMPONENT,
  ISOCHRONE_COMPONENT,
  OPPORTUNITY_COMPONENT,
  REGIONAL_COMPONENT,
  REGIONAL_COMPARISON_COMPONENT
} from '../constants/map'
import EditProjectBounds from '../containers/edit-project-bounds'
import EditRegionalAnalysisBounds from '../containers/edit-regional-analysis-bounds'
import Modal from './modal'
import ModificationEditor from '../containers/modification-editor'
import ScenarioMap from '../containers/scenario-map'
import Isochrone from '../containers/isochrone'
import Opportunity from '../containers/opportunity'
import Regional from '../containers/regional-layer'
import RegionalComparison from '../containers/regional-comparison-layer'
import FeedPreview from './map/feed-preview'
import Sidebar from './sidebar'
import DestinationTravelTimeDistribution from '../containers/destination-travel-time-distribution'

import type {Feed, Feature, LonLat, Modification} from '../types'

// prefer to use canvas for rendering, improves speed significantly
// http://leafletjs.com/reference.html#global
// with this on we might be able to get rid of the stop layer
window.L_PREFER_CANVAS = true

type DefaultProps = {
  variants: string[]
}

type Props = {
  bundleId: string,
  children: any,

  // actions
  loadProject(id: string): void,
  push(string): void,
  setMapCenter(LonLat): void,

  // state
  activeModification: Modification,
  analysisMode: boolean,
  center: LonLat,
  error: string,
  errorMessage: string,
  feeds: Feed[],
  hasError: boolean,
  hasScenario: boolean,
  location: {
    pathname: string
  },
  mapComponents: any[],
  modificationBounds: LatLngBounds,
  projectId?: string,
  outstandingRequests: number,
  scenarioId?: string,
  scenarioIsLoaded: boolean,
  username: string,
  zoom: number
}

type State = {
  center: {lon: number, lat: number},
  zoom: number
}

const TILE_URL = Browser.retina && process.env.LEAFLET_RETINA_URL
  ? process.env.LEAFLET_RETINA_URL
  : process.env.LEAFLET_TILE_URL

export default class Application extends Component<DefaultProps, Props, State> {
  static defaultProps = {
    variants: ['Default']
  }

  state = {
    center: this.props.center,
    zoom: this.props.zoom
  }

  componentWillReceiveProps (nextProps: Props) {
    if (!lonlat.isEqual(nextProps.center, this.props.center)) {
      this.setState({
        center: nextProps.center
      })
    }

    if (nextProps.projectId && this.props.projectId !== nextProps.projectId) {
      this.props.loadProject(nextProps.projectId)
    }
  }

  componentDidMount () {
    if (document.body) {
      document.body.classList.add('Editor')
    }

    const {loadProject, projectId} = this.props
    if (projectId) {
      loadProject(projectId)
    }
  }

  componentWillUnmount () {
    if (document.body) {
      document.body.classList.remove('Editor')
    }
  }

  _setMapCenter = (feature: Feature) => {
    this.props.setMapCenter(feature.geometry.coordinates)
  }

  render () {
    const {
      activeModification,
      analysisMode,
      bundleId,
      children,
      error,
      errorMessage,
      feeds,
      hasError,
      hasScenario,
      location,
      mapComponents,
      modificationBounds,
      outstandingRequests,
      projectId,
      scenarioId,
      scenarioIsLoaded,
      username
    } = this.props
    const {center} = this.state

    return (
      <div id='editor'>
        <Sidebar
          currentPath={location.pathname}
          outstandingRequests={outstandingRequests}
          projectId={projectId}
          scenarioId={scenarioId}
          username={username}
          />
        {hasError &&
          <UiLock
            error={error}
            errorMessage={errorMessage}
            />
        }

        <div
          className={`Fullscreen ${activeModification ? 'hasActiveModification' : ''} ${analysisMode ? 'analysisMode' : ''}`}
          >
          <LeafletMap
            bounds={modificationBounds}
            center={center}
            zoom={12}
            >
            <TileLayer
              url={TILE_URL}
              attribution={process.env.LEAFLET_ATTRIBUTION}
              zIndex={-10}
              />

            {mapComponents.map((type, i) => {
              switch (type) {
                case EDIT_PROJECT_BOUNDS_COMPONENT:
                  return <EditProjectBounds
                    key={`map-component-${i}`}
                    projectId={projectId}
                    />
                case BUNDLE_PREVIEW_COMPONENT:
                  return feeds
                    .map((feed) =>
                      <FeedPreview
                        feed={feed}
                        key={feed.id}
                        />)
                case ISOCHRONE_COMPONENT:
                  return <Isochrone
                    zIndex={30}
                    key={`map-component-${i}`}
                    />
                case OPPORTUNITY_COMPONENT:
                  return <Opportunity
                    key={`map-component-${i}`}
                    />
                case REGIONAL_COMPONENT:
                  return <Regional
                    key={`map-component-${i}`}
                    />
                case REGIONAL_COMPARISON_COMPONENT:
                  return <RegionalComparison
                    key={`map-component-${i}`}
                    />
                case EDIT_REGIONAL_ANALYSIS_BOUNDS_COMPONENT:
                  return <EditRegionalAnalysisBounds
                    key={`map-component-${i}`}
                    />
                case DESTINATION_TRAVEL_TIME_DISTRIBUTION_COMPONENT:
                  return <DestinationTravelTimeDistribution
                    key={`map-component-${i}`}
                  />
              }
            })}

            { process.env.LABEL_TILE_URL && <TileLayer
              zIndex={40}
              url={Browser.retina && process.env.LABEL_RETINA_URL
                  ? process.env.LABEL_RETINA_URL
                  : process.env.LABEL_TILE_URL} />}

            {/* Scenario should go on top of labels */}
            {hasScenario && scenarioIsLoaded && <ScenarioMap zIndex={50} />}
          </LeafletMap>
        </div>

        <div className={`ApplicationDock ${analysisMode ? 'analysisMode' : ''}`}>
          {children}
        </div>

        {activeModification &&
          // Use the modification key to force a replacement so that we can use
          // on mount and un-mount when switching between modifications
          <ModificationEditor
            bundleId={bundleId}
            modification={activeModification}
            projectId={projectId}
            key={activeModification.id}
            />}
      </div>
    )
  }
}

function UiLock ({
  error,
  errorMessage
}) {
  return <Modal>
    <h1>{error}</h1>
    <h3>{errorMessage}</h3>
  </Modal>
}
