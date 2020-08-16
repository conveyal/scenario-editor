// ***********************************************************
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import 'cypress-wait-until'

import {pseudoFixture} from './commands'

before('Optionally wipe configured state', () => {
  cy.wrap(Cypress.env('resetDataBeforeEachRun')).then((resetData) => {
    if (resetData === true) {
      cy.task('touch', pseudoFixture)
      cy.readFile(pseudoFixture).then((storedVals) => {
        if ('regionId' in storedVals) {
          cy.visit(`/regions/${storedVals.regionId}`)
          cy.navTo('Region Settings')
          cy.findByText(/Delete this region/i).click()
          cy.findByText(/Confirm: Delete this region/).click()
        }
      })
      cy.writeFile(pseudoFixture, '{}')
    }
  })
})
