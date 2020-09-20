import {testComponent} from 'lib/utils/component'
import {mockGtfsStops} from 'lib/utils/mock-data'
import GTFSStopGridLayer, {drawStopsInTile} from '../gtfs-stop-gridlayer'

jest.mock('leaflet')

describe('Component > GTFSStopGridLayer', () => {
  it('renders correctly', () => {
    const props = {
      stops: mockGtfsStops
    }

    const wrapper = testComponent(GTFSStopGridLayer, props)
    wrapper.shallow()
  })

  it('should draw stops within a tile', () => {
    const draw = jest.fn()
    drawStopsInTile(mockGtfsStops, {x: 659, y: 1593}, 12, draw)
    expect(draw).toHaveBeenCalledTimes(1)
  })
})
