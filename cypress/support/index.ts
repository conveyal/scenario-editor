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
  preserve: ['appSession.0', 'appSession.1']
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

// Login by storing the cookie data
Cypress.Commands.add('login', () => {
  cy.log('logging in')
  cy.setCookie('appSession.0', Cypress.env('appSession0'), {log: false})
  cy.setCookie('appSession.1', Cypress.env('appSession1'), {log: false})
})

before(() => {
  if (Cypress.env('authEnabled')) {
    cy.login()
  }
})
