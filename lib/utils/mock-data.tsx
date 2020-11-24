import {mount} from 'enzyme'
import {mountToJson} from 'enzyme-to-json'
import React from 'react'
import {Provider} from 'react-redux'
import configureStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import {TextEncoder} from 'util'
import {constructor as XorShift} from 'xorshift'

import {responseToSurface} from '../actions/analysis'
import {ADD_TRIP_PATTERN, TRAVEL_TIME_PERCENTILES} from '../constants'

import multi from './multi'

// Create a random number generator that is seeded
const seededRandom = new XorShift([1, 2, 3, 4])

export const makeMockStore = configureStore([multi, thunkMiddleware])

export const mockWithProvider = (children, mockData = mockStores.init) => {
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

export const mockSegmentGeom: GeoJSON.LineString = {
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

export const mockSegment: CL.ModificationSegment = {
  fromStopId: '1',
  toStopId: null,
  geometry: mockSegmentGeom,
  spacing: 3000,
  stopAtEnd: false,
  stopAtStart: false
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

export const mockGtfsStop1 = {
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
    1: mockGtfsStop1,
    2: mockGtfsStop2
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
  dwellTimes: [12],
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
  sourceName: 'lodes-data-2014',
  name: 'Workers total',
  _id: 'Workers_total'
}

const regionId = '1'

export const mockBundle = {
  ...mockModel,
  errorCode: '',
  name: 'Mock Bundle',
  _id: '1',
  centerLat: 38.90124,
  centerLon: -77.015615,
  feeds: [],
  regionId,
  serviceStart: '2018-09-27',
  serviceEnd: '2018-09-28',
  status: 'DONE',
  totalFeeds: 0
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
  _id: regionId,
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
  timetables: [mockTimetable],
  trips: ['abcd'],
  type: ADD_TRIP_PATTERN,
  variants: [true]
}

export const mockProfileRequest = {
  accessModes: 'WALK',
  bikeSafe: 1,
  bikeSlope: 1,
  bikeSpeed: 4.166666666666667,
  bikeTime: 1,
  bounds: mockRegion.bounds,
  bundleId: mockBundle._id,
  date: '2016-01-16',
  defaultExpanded: true,
  directModes: 'WALK',
  egressModes: 'WALK',
  fromLat: 12,
  fromLon: 34,
  fromTime: 25200,
  maxBikeTime: 20,
  maxRides: 4,
  maxTripDurationMinutes: 60,
  maxWalkTime: 20,
  monteCarloDraws: 200,
  name: 'Profile Request Test',
  projectId: mockProject._id,
  reachabilityThreshold: 0,
  regionId: mockRegion._id,
  toTime: 32400,
  transitModes: 'BUS,TRAM,RAIL,SUBWAY',
  travelTimePercentile: 50,
  variantIndex: 0,
  walkSpeed: 1.3888888888888888,
  workerVersion: 'v4.0.0'
}

export const mockRegionalAnalyses = [
  {
    ...mockModel,
    zoom: 9,
    bounds: {},
    complete: true,
    deleted: false,
    destinationPointSetIds: ['Jobs_total'],
    status: 'DONE',
    workerVersion: 'v3.2.0',
    width: 300,
    height: 300,
    north: 20024,
    west: 20015,
    name: 'ANALYSIS 1',
    grid: 'Jobs_total',
    projectId: '1',
    variant: 0,
    bundleId: '1',
    cutoffMinutes: 60,
    cutoffsMinutes: [60],
    _id: 'abcd',
    request: mockProfileRequest,
    // percentile -1 indicates this analysis was done using Andrew Owen-style average instantaneous accessibility
    travelTimePercentile: -1,
    travelTimePercentiles: [50]
  },
  {
    ...mockModel,
    zoom: 9,
    bounds: {},
    complete: true,
    deleted: false,
    destinationPointSetIds: ['Jobs_total'],
    status: 'DONE',
    workerVersion: 'v3.2.0',
    width: 300,
    height: 300,
    north: 20024,
    west: 20015,
    name: 'ANALYSIS 2',
    grid: 'Jobs_total',
    projectId: '1',
    variant: 1,
    bundleId: '1',
    cutoffMinutes: 60,
    cutoffsMinutes: [60],
    _id: 'efgh',
    request: mockProfileRequest,
    travelTimePercentile: 50,
    travelTimePercentiles: [50]
  }
]

const GRID_SIZE = 300
const GRID_MAX = 2000
export const mockGrids = mockRegionalAnalyses.map((ra) => ({
  analysisId: ra._id,
  percentile: 50,
  cutoff: 60,
  zoom: 9,
  width: GRID_SIZE,
  height: GRID_SIZE,
  north: 20024,
  west: 20015,
  data: Array(GRID_SIZE * GRID_SIZE)
    .fill(0)
    .map(() => Math.floor(seededRandom.random() * GRID_MAX)),
  min: 0,
  max: GRID_MAX,
  contains: () => true
}))

export const mockGrid = mockGrids[0]

export const mockStores = {
  init: {
    analysis: {
      copyRequestSettings: true,
      isochroneFetchStatus: false,
      regional: {
        bounds: mockRegion.bounds
      },
      requestsSettings: [mockProfileRequest],
      resultsSettings: [],
      maxTripDurationMinutes: 60,
      travelTimePercentile: 50
    },
    network: {
      error: null,
      outstandingRequests: 0
    },
    opportunityDatasets: {
      active: mockOpportunityDataset._id,
      datasets: mockRegion.opportunityDatasets,
      uploadStatuses: []
    },
    queryString: {
      analysisId: mockRegionalAnalyses[0]._id,
      cutoff: 60,
      percentile: 50,
      modificationId: mockModification._id,
      projectId: mockProject._id,
      regionId: mockRegion._id
    },
    region: {
      aggregationAreas: [],
      bundles: [mockBundle],
      regions: [mockRegion]
    },
    regionalAnalyses: {
      analyses: mockRegionalAnalyses,
      grids: mockGrids
    },
    project: {
      activeModificationId: mockModification._id,
      currentProject: mockProject,
      feeds: [mockFeed],
      modifications: [mockModification],
      projects: [mockProject]
    },
    user: {
      idToken: null
    }
  }
}

export const mockScenarioApplicationError = {
  modificationId: 'Add Trip Pattern',
  title: "Error while applying the modification entitled 'Add Trip Pattern'.",
  messages: ['Headway is not greater than zero.']
}

export const mockSurfaceParameters = {
  width: 5,
  height: 5,
  depth: 5,
  zoom: 9,
  north: 40000,
  west: 40000
}

/**
 * This is a function because responseToSurface is destructive and can lead to
 * test leakage if we don't have a brand-new surface each time.
 */
export const createMockSurfaceData = () => {
  const {width, height, depth, zoom, north, west} = mockSurfaceParameters

  const metadata = {
    scenarioApplicationWarnings: [mockScenarioApplicationError]
  }

  const metadataEncoded = new TextEncoder().encode(JSON.stringify(metadata))
  const bufSize =
    9 * 4 + // header
    width * height * depth * 4 + // data
    metadataEncoded.length // metadata

  const buffer = new ArrayBuffer(bufSize)
  const surfaceData = new Int32Array(buffer, 0, 9 + width * height * depth)

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
  surfaceData[8] = depth

  // phew, header is done
  for (let z = 0, position = 9; z < depth; z++) {
    let prev = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++, position++) {
        const pixelVal = getMockSurfaceValue(x, y, z)
        surfaceData[position] = pixelVal - prev // values are delta-coded within each depth
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

/**
 * Return the value stored in sample z of pixel x, y of the mock surface
 */
export function getMockSurfaceValue(x, y, z) {
  // This used to simply return z, 2 * z and 3 * z when we had an array of
  // [5, 10, 15 . . . 95]th percentiles. However, when we switched to
  // requesting specific percentiles that stopped working. This translates the
  // position in the access grid into a percentile, then subtracts five and
  // divides by five to get the position in the old array, so that tests
  // written assuming the old structure continue to pass.
  if (x < 2 && y < 2) return (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  if (x >= 2 && y >= 2) return (TRAVEL_TIME_PERCENTILES[z] - 5) / 5
  if (x >= 2 && y < 2) return (2 * (TRAVEL_TIME_PERCENTILES[z] - 5)) / 5
  if (x < 2 && y >= 2) return (3 * (TRAVEL_TIME_PERCENTILES[z] - 5)) / 5
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
  data: opportunityDatasetGridData,
  getValue(x, y) {
    return opportunityDatasetGridData[y * mockSurfaceParameters.width + x]
  }
}

export const releaseVersions = ['v3.0.0', 'v2.2.0', 'v2.0.0']
export const allVersions = [
  'v3.0.0',
  'v2.2.0-2-g789df3e',
  'v2.2.0',
  'v2.0.0-19-g589f32f',
  'v2.0.0'
]
