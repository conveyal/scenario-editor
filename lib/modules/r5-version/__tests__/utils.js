import {versionToNumber} from '../utils'

const TEST_VERSIONS = [
  'v3.6.9-46',
  'v3.0.0',
  'v2.0.0',
  'v3.1.0',
  'v4.5.0',
  'v3.1.0-1'
]

describe('R5 Version > Utils', () => {
  it('should properly convert versions to numbers', () => {
    const versionsToTest = [
      {
        input: TEST_VERSIONS[2],
        output: 20000
      },
      {
        input: TEST_VERSIONS[0],
        output: 30609.46
      }
    ]

    versionsToTest.forEach((v) =>
      expect(versionToNumber(v.input)).toBe(v.output)
    )
    expect(versionToNumber('v3.2.1-1')).toBeGreaterThan(
      versionToNumber('v3.2.1')
    )
    expect(versionToNumber('v6.2')).toBeGreaterThan(versionToNumber('v6.0.1'))
    expect(versionToNumber('v6.2')).toBeGreaterThan(
      versionToNumber('v6.1.1-48-afadf')
    )
  })
})
