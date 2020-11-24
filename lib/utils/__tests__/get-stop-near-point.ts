import {expect} from '@jest/globals'
import getStopNearPoint from '../get-stop-near-point'

const stops = [
  {
    stop_id: '1',
    stop_name: '1',
    stop_lat: 40,
    stop_lon: -70
  },
  {
    stop_id: '2',
    stop_name: '2',
    stop_lat: 41,
    stop_lon: -71
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
