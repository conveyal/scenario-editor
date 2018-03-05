// @flow

import multi from '@conveyal/woonerf/store/multi'
import promise from '@conveyal/woonerf/store/promise'
import {middleware as fetchMiddleware} from '@conveyal/woonerf/fetch'
import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'
import React from 'react'
import {Provider} from 'react-redux'
import configureStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import {TextEncoder} from 'text-encoding'

import {responseToSurface} from '../actions/analysis'
import {ADD_TRIP_PATTERN, TRAVEL_TIME_PERCENTILES} from '../constants'

export const makeMockStore = configureStore([
  fetchMiddleware,
  multi,
  promise,
  thunkMiddleware
])

export const mockWithProvider = (children: any, mockData: any = mockStores.init) => {
  const store = makeMockStore(mockData)
  const wrapper = mount(<Provider store={store}>{children}</Provider>)

  return {
    snapshot: () => mountToJson(wrapper),
    store,
    wrapper
  }
}

export const mockModel = {
  accessGroup: 'accessGroupName',
  createdAt: '2017-11-08T12:30:50.133Z',
  createdBy: 'person@gmail.com',
  nonce: '12345',
  updatedAt: '2017-11-08T12:31:19.602Z',
  updatedBy: 'person@gmail.com'
}

export const mockSegmentGeom = {
  type: 'LineString',
  coordinates: [
    [-122.0246, 36.9707],
    [-122.0279, 37.049],
    [-121.9799, 37.2299],
    [-121.9445, 37.324],
    [-121.936, 37.353],
    [-121.924, 37.365]
  ]
}

export const mockSegment = {
  fromStopId: '1',
  geometry: mockSegmentGeom,
  properties: {},
  spacing: 3000,
  stopAtEnd: false,
  stopAtStart: false,
  type: 'Feature'
}

export const mockStop1 = {
  autoCreated: false,
  bearing: 0,
  center: [36.9707, -122.0246],
  distanceFromStart: 0,
  index: 0,
  lat: 36.9707,
  lon: -122.0246,
  stopId: '1'
}

const mockGtfsStop1 = {
  stop_id: '1',
  stop_lat: 36.9707,
  stop_lon: -122.0246,
  stop_name: 'Santa Cruz'
}

const mockGtfsStop2 = {
  stop_id: '2',
  stop_lat: 37.049,
  stop_lon: -122.0279,
  stop_name: 'Scotts Valley'
}

export const mockGtfsStops = [mockGtfsStop1, mockGtfsStop2]

export const mockPattern = {
  geometry: mockSegmentGeom,
  name: 'Mock Pattern',
  pattern_id: 'mock-pattern-id',
  stops: mockGtfsStops,
  trips: [
    {
      duration: 1234,
      end_time: 13579,
      start_time: 12345,
      trip_headsign: 'To Downtown',
      trip_id: 'abcd',
      trip_short_name: 'The Express'
    }
  ]
}

export const mockRoute = {
  label: 'mock-route-label',
  patterns: [mockPattern],
  route_id: 'route1'
}

export const mockFeed = {
  checksum: 'MOCK',
  id: '1',
  routes: [mockRoute],
  stopsById: {
    '1': mockGtfsStop1,
    '2': mockGtfsStop2
  },
  stops: [mockGtfsStop1, mockGtfsStop2]
}

export const mockMapState = {
  allowExtend: true,
  extendFromEnd: true,
  followRoad: true,
  state: 'add-trip-pattern',
  modificationId: '1234'
}

export const mockTimetable = {
  _id: 'timetable-id',
  name: 'Test timetable',
  segmentSpeeds: [],
  dwellTime: 10,
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
  headwaySecs: 900, // 15 minutes
  startTime: 28800, // 8am
  endTime: 57600, // 4pm
  patternTrips: ['abcd'],
  sourceTrip: 'abcd',
  phaseFromTimetable: '',
  phaseFromStop: '',
  phaseAtStop: '',
  phaseSeconds: 300,
  exactTimes: false,
  modificationId: '1234',
  modificationName: 'Test Modification'
}

export const mockOpportunityDataset = {
  dataSource: 'lodes-data-2014',
  name: 'Workers total',
  key: 'Workers_total'
}

export const mockRegion = {
  ...mockModel,
  bounds: {
    north: 39,
    east: -76,
    south: 38,
    west: -77
  },
  description: 'Region description',
  _id: '1',
  name: 'Mock Region',
  opportunityDatasets: [mockOpportunityDataset],
  statusCode: 'DONE'
}

export const mockProject = {
  ...mockModel,
  bundleId: '1',
  _id: '1',
  name: 'Mock Project',
  regionId: mockRegion._id,
  variants: ['Default']
}

export const mockModification = {
  ...mockModel,
  bidirectional: false,
  description: 'Mock description',
  entries: [],
  feed: mockFeed.id,
  _id: '1234',
  name: 'Test Modification',
  routes: [mockRoute.route_id],
  projectId: mockProject._id,
  segments: [mockSegment],
  showOnMap: false,
  timetables: [mockTimetable],
  trips: ['abcd'],
  type: ADD_TRIP_PATTERN,
  variants: [true]
}

export const mockBundle = {
  ...mockModel,
  name: 'Mock Bundle',
  _id: '1',
  centerLat: 38.90124,
  centerLon: -77.015615,
  feeds: [],
  regionId: mockRegion._id,
  totalFeeds: 0
}

export const mockProfileRequest = {
  date: '2016-01-16',
  fromTime: 25200,
  toTime: 32400,
  accessModes: 'WALK',
  directModes: 'WALK',
  egressModes: 'WALK',
  transitModes: 'BUS,TRAM,RAIL,SUBWAY',
  walkSpeed: 1.3888888888888888,
  bikeSpeed: 4.166666666666667,
  reachabilityThreshold: 0,
  bikeSafe: 1,
  bikeSlope: 1,
  bikeTime: 1,
  monteCarloDraws: 200,
  maxRides: 4,
  maxTripDurationMinutes: 60,
  travelTimePercentile: 50
}

export const mockStores = {
  init: {
    analysis: {
      isFetchingIsochrone: false,
      profileRequest: mockProfileRequest,
      regional: {
        bounds: mockRegion.bounds
      }
    },
    mapState: {
      activeTrips: [],
      center: {
        lat: 38.8886,
        lon: -77.043
      },
      components: [],
      zoom: 12
    },
    network: {
      error: null,
      outstandingRequests: 0
    },
    opportunityDatasets: {
      active: mockOpportunityDataset.key,
      datasets: mockRegion.opportunityDatasets,
      uploadStatuses: []
    },
    region: {
      currentRegionId: mockRegion._id,
      regions: [mockRegion]
    },
    routing: {
      locationBeforeTransitions: null
    },
    project: {
      activeModificationId: mockModification._id,
      bundles: [mockBundle],
      currentProject: mockProject,
      feeds: [mockFeed],
      feedsById: {
        [mockFeed.id]: mockFeed
      },
      modifications: [mockModification],
      projects: [mockProject]
    },
    user: {
      idToken: null
    }
  }
}

export const mockProjectApplicationError = {
  modificationId: 'Add Trip Pattern',
  title: "Error while applying the modification entitled 'Add Trip Pattern'.",
  messages: ['Headway is not greater than zero.']
}

export const mockRegionalAnalyses = [
  {
    ...mockModel,
    zoom: 9,
    bounds: {},
    complete: true,
    deleted: false,
    status: 'DONE',
    workerVersion: 'v3.2.0',
    width: 300,
    height: 300,
    north: 20024,
    west: 20015,
    name: 'ANALYSIS 1',
    grid: 'Jobs_total',
    projectId: '1234',
    variant: 0,
    bundleId: '5678',
    cutoffMinutes: 60,
    _id: 'abcd',
    request: mockProfileRequest,
    // percentile -1 indicates this analysis was done using Andrew Owen-style average instantaneous accessibility
    travelTimePercentile: -1
  },
  {
    ...mockModel,
    zoom: 9,
    bounds: {},
    complete: true,
    deleted: false,
    status: 'DONE',
    workerVersion: 'v3.2.0',
    width: 300,
    height: 300,
    north: 20024,
    west: 20015,
    name: 'ANALYSIS 2',
    grid: 'Jobs_total',
    projectId: '4321',
    variant: 1,
    bundleId: '5678',
    cutoffMinutes: 60,
    _id: 'efgh',
    request: mockProfileRequest,
    travelTimePercentile: 42
  }
]

export const mockGrid = {
  zoom: 9,
  width: 300,
  height: 300,
  north: 20024,
  west: 20015,
  data: [],
  min: 0,
  max: 2000,
  contains (x: number, y: number) { return true }
}

export const mockBookmark = {
  ...mockModel,
  _id: 'bookmarkid',
  name: 'Bookmark',
  profileRequest: mockProfileRequest,
  isochroneCutoff: 42,
  opportunityDataset: 'Workers_total',
  regionId: 'REGION'
}

export const mockSurfaceParameters = {
  width: 5,
  height: 5,
  nSamples: 5,
  zoom: 9,
  north: 40000,
  west: 40000
}

// this is a function because responseToSurface is destructive and can lead to test leakage if we
// don't have a brand-new surface each time
export const createMockSurfaceData = () => {
  const {width, height, nSamples, zoom, north, west} = mockSurfaceParameters

  const metadata = {
    projectApplicationWarnings: [mockProjectApplicationError]
  }

  const metadataEncoded = new TextEncoder().encode(JSON.stringify(metadata))
  const bufSize =
    9 * 4 + // header
    width * height * nSamples * 4 + // data
    metadataEncoded.length // metadata

  const buffer = new ArrayBuffer(bufSize)
  const surfaceData = new Int32Array(buffer, 0, 9 + width * height * nSamples)

  // text header ("ACCESSGR")
  surfaceData[0] = 1162036033 // ACCE
  surfaceData[1] = 1380406099 // SSGR

  // version
  surfaceData[2] = 0

  surfaceData[3] = zoom
  surfaceData[4] = west
  surfaceData[5] = north
  surfaceData[6] = width
  surfaceData[7] = height
  surfaceData[8] = nSamples

  // phew, header is done
  for (let y = 0, pixel = 9; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let prev = 0
      for (let z = 0; z < nSamples; z++, pixel++) {
        const pixelVal = getMockSurfaceValue(x, y, z)
        surfaceData[pixel] = pixelVal - prev // values are delta-coded within each pixel
        prev = pixelVal
      }
    }
  }

  // copy metadata
  const metadataBuffer = new Uint8Array(
    buffer,
    buffer.byteLength - metadataEncoded.byteLength,
    metadataEncoded.length
  )
  for (let i = 0; i < metadataEncoded.length; i++) {
    metadataBuffer[i] = metadataEncoded[i]
  }

  return buffer
}

export const mockSurface = responseToSurface(createMockSurfaceData())

// Return the value that should be stored in sample z of pixel x, y of the mock surface
export function getMockSurfaceValue (x: number, y: number, z: number): number {
  // this used to simply return z, 2 * z and 3 * z when we had an array of [5, 10, 15 . . . 95]th
  // percentiles. However, when we switched to requesting specific percentiles that stopped working.
  // This translates the position in the access grid into a percentile, then subtracts five and divides
  // by five to get the position in the old array, so that tests written assuming the old structure continue
  // to pass.
  if (x < 2 && y < 2) return (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  if (x >= 2 && y >= 2) return (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  if (x >= 2 && y < 2) return 2 * (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  if (x < 2 && y >= 2) return 3 * (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  return 0
}

const opportunityDatasetGridData = new Int32Array(
  mockSurfaceParameters.width * mockSurfaceParameters.height
)
// top half of grid is 1, bottom half is 2
for (let i = 0; i < 3 * mockSurfaceParameters.width; i++) {
  opportunityDatasetGridData[i] = 1
}
for (
  let i = 3 * mockSurfaceParameters.width;
  i < opportunityDatasetGridData.length;
  i++
) {
  opportunityDatasetGridData[i] = 2
}

export const mockDestinationGrid = {
  ...mockSurfaceParameters,
  west: mockSurfaceParameters.west - 1, // shift slightly so that we are testing misaligned grids
  north: mockSurfaceParameters.north - 1,
  data: opportunityDatasetGridData
}

export const releaseVersions = ['v3.0.0', 'v2.2.0', 'v2.0.0']
export const allVersions = [
  'v3.0.0',
  'v2.2.0-2-g789df3e',
  'v2.2.0',
  'v2.0.0-19-g589f32f',
  'v2.0.0'
]
