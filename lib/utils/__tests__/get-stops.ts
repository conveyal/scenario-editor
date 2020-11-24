import {expect} from '@jest/globals'
import getStops from '../get-stops'

const segment: CL.ModificationSegment = {
  fromStopId: '1',
  toStopId: '2',
  geometry: {
    coordinates: [-70, 40],
    type: 'Point'
  },
  spacing: 250,
  stopAtEnd: true,
  stopAtStart: true
}

const stop: CL.StopFromSegment = {
  stopId: segment.fromStopId,
  index: 0,
  lat: 40,
  lng: -70,
  autoCreated: false,
  distanceFromStart: 0
}

describe('Project-Map > Transit-Editor > getStops', () => {
  it('works correctly for a point', () => {
    const stops = getStops([segment])
    expect(stops).toHaveLength(1)
    expect(stops[0]).toEqual(stop)
  })

  it('works correctly for a lineString', () => {
    const stops = getStops([
      {
        ...segment,
        geometry: {
          coordinates: [
            [-70, 40],
            [-70.1, 40.1]
          ],
          type: 'LineString'
        }
      }
    ])
    expect(stops).toHaveLength(57)
    expect(stops[0]).toEqual(stop)
    const endStop = stops.slice(-1)[0]
    expect(endStop.stopId).toBe('2')
    expect(endStop.lat).toBe(40.1)
    expect(endStop.distanceFromStart).toBeCloseTo(14003.359501694065, 2)
  })
})
