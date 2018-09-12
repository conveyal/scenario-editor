// @flow

import clone from 'lodash/cloneDeep'
import React from 'react'

import {
  mockModification,
  mockSegment,
  mockWithProvider
} from '../../../utils/mock-data'
import CopyTimetable from '../copy-timetable'

const mockRegionId = 'r1'
const mockRegionIdWithNoTimetables = 'r2'

const mockProject = {
  _id: 'p1',
  modifications: [mockModification],
  name: 'mock project'
}

// response only includes regions, projects and modifications that
// all have at least one timetable
const mockResponse = [{
  projects: [{
    name: 'mock project',
    _id: 'p1',
    modifications: [{
      timetables: [{
        _id: 't1',
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        name: 'M-F',
        startTime: 25200,
        endTime: 79200,
        headwaySecs: 600,
        exactTimes: false,
        phaseAtStop: null,
        phaseFromTimetable: null,
        phaseFromStop: null,
        phaseSeconds: 0,
        dwellTime: 0,
        segmentSpeeds: [16],
        dwellTimes: []
      }],
      name: 'mock modification',
      _id: 'm1',
      segments: [mockSegment]
    }]
  }],
  name: 'mock region',
  _id: 'r1'
}]

let serverResponse = mockResponse

function getTimetables () {
  return Promise.resolve({
    status: 200,
    value: serverResponse
  })
}

function timeoutPromise () {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500)
  })
}

describe('Component > Modification > CopyTimetable', () => {
  it('renders correctly', async () => {
    serverResponse = mockResponse

    const {snapshot} = mockWithProvider(
      <CopyTimetable
        create={jest.fn()}
        currentModification={mockModification}
        currentProject={mockProject}
        currentRegionId={mockRegionId}
        getTimetables={() => new Promise((resolve, reject) => {
          setTimeout(resolve(getTimetables()), 200)
        })}
      />
    )

    // snapshot loading state
    expect(snapshot()).toMatchSnapshot()

    // wait for load to finish
    await timeoutPromise()

    // snapshot loaded state
    expect(snapshot()).toMatchSnapshot()
  })

  it('can select a timetable', async () => {
    serverResponse = mockResponse

    const create = jest.fn()
    const {wrapper} = mockWithProvider(
      <CopyTimetable
        create={create}
        currentModification={mockModification}
        currentProject={mockProject}
        currentRegionId={mockRegionId}
        getTimetables={getTimetables}
      />
    )

    // wait for load to finish
    await timeoutPromise()

    // confirm the selected timetable
    wrapper
      .find('a')
      .simulate('click')

    expect(create.mock.calls[0][0]).toMatchSnapshot()
  })

  // if rendering a region without any timetables, show the first
  // timetable that is available
  it('renders with a region without timetables', async () => {
    serverResponse = mockResponse

    const {snapshot} = mockWithProvider(
      <CopyTimetable
        create={jest.fn()}
        currentModification={mockModification}
        currentProject={mockProject}
        currentRegionId={mockRegionIdWithNoTimetables}
        getTimetables={getTimetables}
      />
    )

    // wait for load to finish
    await timeoutPromise()

    // snapshot loaded state
    expect(snapshot()).toMatchSnapshot()
  })

  // a test case for when no timetables are available to copy
  it('renders when no timetables exist in database', async () => {
    serverResponse = []

    const {snapshot} = mockWithProvider(
      <CopyTimetable
        create={jest.fn()}
        currentModification={mockModification}
        currentProject={mockProject}
        currentRegionId={mockRegionIdWithNoTimetables}
        getTimetables={getTimetables}
      />
    )

    // wait for load to finish
    await timeoutPromise()

    // snapshot loaded state
    expect(snapshot()).toMatchSnapshot()
  })

  describe('segment warnings', () => {
    it('shows a warning when current modification has no segments', async () => {
      serverResponse = mockResponse

      const {snapshot} = mockWithProvider(
        <CopyTimetable
          create={jest.fn()}
          currentModification={{
            ...mockModification,
            segments: []
          }}
          currentProject={mockProject}
          currentRegionId={mockRegionId}
          getTimetables={getTimetables}
        />
      )

      // wait for load to finish
      await timeoutPromise()

      // snapshot loaded state
      expect(snapshot()).toMatchSnapshot()
    })

    it('shows a warning when modification of timetable being copied has no segments', async () => {
      serverResponse = clone(mockResponse)
      serverResponse[0].projects[0].modifications[0].segments = []
      serverResponse[0].projects[0].modifications[0].timetables[0].segmentSpeeds = []

      const {snapshot} = mockWithProvider(
        <CopyTimetable
          create={jest.fn()}
          currentModification={mockModification}
          currentProject={mockProject}
          currentRegionId={mockRegionId}
          getTimetables={getTimetables}
        />
      )

      // wait for load to finish
      await timeoutPromise()

      // snapshot loaded state
      expect(snapshot()).toMatchSnapshot()
    })

    it('shows a warning when modification of timetable being copied has more segments', async () => {
      serverResponse = clone(mockResponse)
      serverResponse[0].projects[0].modifications[0].segments.push(mockSegment)
      serverResponse[0].projects[0].modifications[0].timetables[0].segmentSpeeds.push(17)

      const {snapshot} = mockWithProvider(
        <CopyTimetable
          create={jest.fn()}
          currentModification={mockModification}
          currentProject={mockProject}
          currentRegionId={mockRegionId}
          getTimetables={getTimetables}
        />
      )

      // wait for load to finish
      await timeoutPromise()

      // snapshot loaded state
      expect(snapshot()).toMatchSnapshot()
    })

    it('shows a warning when modification of timetable being copied has less segments', async () => {
      serverResponse = mockResponse

      const segments = [...mockModification.segments, mockSegment]

      const {snapshot} = mockWithProvider(
        <CopyTimetable
          create={jest.fn()}
          currentModification={{
            ...mockModification,
            segments
          }}
          currentProject={mockProject}
          currentRegionId={mockRegionId}
          getTimetables={getTimetables}
        />
      )

      // wait for load to finish
      await timeoutPromise()

      // snapshot loaded state
      expect(snapshot()).toMatchSnapshot()
    })
  })
})
