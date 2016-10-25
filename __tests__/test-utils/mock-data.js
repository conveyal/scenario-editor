import multi from 'mastarm/react/store/multi'
import configureStore from 'redux-mock-store'
import promise from 'redux-promise'

export const makeMockStore = configureStore([multi, promise])

export const mockSegmentGeom = {
  type: 'LineString',
  coordinates: [
    [
      -122.0246,
      36.9707
    ],
    [
      -122.0279,
      37.049
    ],
    [
      -121.9799,
      37.2299
    ],
    [
      -121.9445,
      37.324
    ],
    [
      -121.936,
      37.353
    ],
    [
      -121.924,
      37.365
    ]
  ]
}

export const mockSegment = {
  type: 'Feature',
  properties: {},
  geometry: mockSegmentGeom
}

const mockStop1 = {
  stop_id: '1',
  stop_lat: 36.9707,
  stop_lon: -122.0246,
  stop_name: 'Santa Cruz'
}

const mockStop2 = {
  stop_id: '2',
  stop_lat: 37.049,
  stop_lon: -122.0279,
  stop_name: 'Scotts Valley'
}

export const mockStops = [mockStop1, mockStop2]

const mockRoute = {
  patterns: [
    {
      geometry: mockSegmentGeom,
      stops: mockStops,
      trips: [
        {
          trip_id: 'abcd',
          start_time: 12345,
          trip_short_name: 'The Express',
          trip_headsign: 'To Downtown',
          duration: 1234
        }
      ]
    }
  ]
}

export const mockFeed = {
  routes: [mockRoute],
  routesById: {
    route1: mockRoute
  },
  stopsById: {
    '1': mockStop1,
    '2': mockStop2
  }
}

export const mockMapState = {
  allowExtend: true,
  extendFromEnd: true,
  followRoad: true,
  state: 'add-trip-pattern',
  modificationId: '1234'
}

export const mockTimetable = {
  name: 'Test timetable',
  speed: 40,
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
  sourceTrip: 'abcd'
}

export const mockModification = {
  bidirectional: false,
  entries: [],
  feed: '1',
  id: '1234',
  name: 'Test Modification',
  routes: ['route1'],
  segments: [],
  showOnMap: false,
  timetables: [mockTimetable],
  trips: ['abcd']
}

export const mockProject = {
  bounds: {
    north: 39,
    east: -76,
    south: 38,
    west: -77
  },
  description: 'Project description',
  id: '1',
  name: 'Mock Project'
}

export const mockScenario = {
  bundleId: '1',
  id: '1',
  name: 'Mock Scenario',
  projectId: '1',
  variants: ['Default']
}

export const mockStores = {
  init: {
    analysis: {
      isFetchingIsochrone: false,
      isochroneCutoff: 60
    },
    mapState: {
      activeTrips: [],
      center: {
        lat: 38.8886,
        lng: -77.043
      },
      components: [],
      zoom: 12
    },
    network: {
      error: null,
      outstandingRequests: 0
    },
    project: {
      currentProject: null,
      projects: [],
      projectsById: {}
    },
    routing: {
      locationBeforeTransitions: null
    },
    scenario: {
      bundles: [],
      bundlesById: {},
      currentBundle: null,
      currentScenario: null,
      feeds: [],
      feedsById: {},
      modifications: [],
      modificationsById: {},
      modificationsByType: {},
      scenarios: [],
      scenariosById: {},
      variants: []
    },
    user: {
      idToken: null
    }
  }
}
