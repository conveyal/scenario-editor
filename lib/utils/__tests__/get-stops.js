// @flow

import getStops from '../get-stops'

describe('Project-Map > Transit-Editor > getStops', () => {
  it('works correctly for a point', () => {
    const segments = [
      {
        fromStopId: '1',
        geometry: {
          coordinates: [-122.0246, 36.9707],
          type: 'Point'
        },
        spacing: 0.25,
        stopAtEnd: false,
        stopAtStart: true
      }
    ]
    expect(getStops(segments)).toMatchSnapshot()
  })
})
