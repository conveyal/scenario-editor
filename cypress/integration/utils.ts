import Region from '../models/region'
import scratchRegion from '../fixtures/regions/scratch.json'

// Re-export the scratch data
export {default as scratchRegion} from '../fixtures/regions/scratch.json'
export {default as scratchResults} from '../fixtures/regions/scratch-results.json'

// Prefix each name with a value for easy database queries later
export const prefixName = (name: string): string =>
  Cypress.env('dataPrefix') + name

// All modification types
export const ModificationTypes: Cypress.ModificationType[] = [
  'Add Streets',
  'Add Trip Pattern',
  'Adjust Dwell Time',
  'Adjust Speed',
  'Convert To Frequency',
  'Modify Streets',
  'Remove Stops',
  'Remove Trips',
  'Reroute',
  'Custom'
]

// Store the default region
let defaultRegion: null | Region = null

/**
 * Use the default region
 */
export function getDefaultRegion(): Region {
  if (defaultRegion) return defaultRegion
  defaultRegion = getRegion(scratchRegion.name, scratchRegion.bounds)

  // Create a default bundle
  defaultRegion.getBundle(
    scratchRegion.feedAgencyName,
    scratchRegion.GTFSfile,
    scratchRegion.PBFfile
  )

  // Create a default opportunity dataset
  defaultRegion.getOpportunityDataset(
    scratchRegion.opportunities.grid.name,
    scratchRegion.opportunities.grid.file
  )

  // Create a default project
  defaultRegion.getProject('Default Test Project')

  return defaultRegion
}

/**
 * Find or create a new region.
 */
export function getRegion(name: string, bounds: CL.Bounds): Region {
  const region = new Region(name)
  before(`getRegion(${region.name})`, () => {
    cy.visitHome()
    cy.get('button').then((buttons) => {
      const pb = buttons.filter((_, el) => el.textContent === region.name)
      if (pb.length === 0) {
        cy.createRegion(region.name, bounds)
      } else {
        cy.wrap(pb.first()).click()
      }
      cy.location('pathname')
        .should('match', /regions\/\w{24}$/)
        .then((path) => {
          region.path = path
        })
    })
  })
  return region
}
