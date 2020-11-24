// ***********************************************************
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@testing-library/cypress/add-commands'
import 'cypress-file-upload'
import {addMatchImageSnapshotCommand} from 'cypress-image-snapshot/command'
import 'cypress-wait-until'

import './analysis'
import './bundle'
import './commands'
import './modification'
import './opportunities'
import './region'

addMatchImageSnapshotCommand({
  failureThresholdType: 'percent',
  failureThreshold: 0.05 // allow up to a 5% image diff
})

// Persist the user cookie across sessions
Cypress.Cookies.defaults({
  preserve: ['a0:state', 'a0:session', 'a0:redirectTo', 'adminTempAccessGroup']
})

// Should data be reset?
const resetData = Cypress.env('resetDataBeforeEachRun')
const localFixturePath = Cypress.env('localFixturePath')

/**
 * TODO do this directly via MongoDB
 */
before('Optionally wipe configured state', () => {
  if (resetData === true) {
    Cypress.log({
      displayName: 'clearDB',
      message: 'Deleting region saved in .scratch.json'
    })
    cy.task('ensureExists', localFixturePath)
    cy.readFile(localFixturePath).then((storedVals) => {
      if ('regionId' in storedVals) {
        cy.visit(`/regions/${storedVals.regionId}/edit`)
        cy.findByRole('button', {name: /Delete this region/i}).click()
        cy.findByRole('button', {name: /Confirm: Delete this region/}).click()
        cy.location('pathname').should('eq', '/')
      }
    })
    cy.writeFile(localFixturePath, '{}')
  }
})

/**
 * Uncaught exceptions should not occur in the app, but we need to be able to test what happens when they do.
 */
Cypress.on('uncaught:exception', (err) => {
  console.error(err)
  // returning false here prevents Cypress from
  // failing the test
  return false
})
