import {expect} from '@jest/globals'
import getStopNearPoint from '../get-stop-near-point'

const stops: GTFS.Stop[] = [
  {
    id: '1',
    name: '1',
    lat: 40,
    lon: -70
  },
  {
    id: '2',
    name: '2',
    lat: 41,
    lon: -71
  }
]

describe('Utils > Get Stop Near Point', () => {
  it('should return a stop within max distance', () => {
    const stop = getStopNearPoint([-70.1, 40.1], stops, 1)
    expect(stop).toBe(stops[0])
  })

  it('should fail to return a stop if none are close enough', () => {
    const stop = getStopNearPoint([-70.1, 40.1], stops, 20)
    expect(stop).toBeNull()
  })
})
