/* global jest */

import { basicRenderTest } from '../../../testUtils/unitUtils'

jest.mock('react-select-geocoder', () => 'ReactSelctGeocoder')
jest.mock('../../../lib/components/icon', () => 'Icon')

import Control from '../../../lib/components/map/control'

basicRenderTest({
  component: Control,
  name: 'Map > Control',
  notToBeCalledFns: [
    'addIsochroneLayerToMap',
    'clearIsochroneResults',
    'removeIsochroneLayerFromMap',
    'setIsochroneCutoff',
    'setIsochroneLatLng'
  ],
  props: {
    addIsochroneLayerToMap: jest.fn(),
    center: {
      lat: 38.898,
      lon: -77.015
    },
    clearIsochroneResults: jest.fn(),
    geocoderApiKey: 'MAPZEN_SEARCH_KEY',
    isochroneCutoff: 3600,
    isFetchingIsochrone: false,
    isShowingIsochrone: false,
    removeIsochroneLayerFromMap: jest.fn(),
    setIsochroneCutoff: jest.fn(),
    setIsochroneLatLng: jest.fn()
  }
})
