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
  preserve: [
    'a0:state',
    'a0:session',
    'a0:redirectTo',
    'appSession.0',
    'appSession.1',
    'adminTempAccessGroup',
    'cypressTestData'
  ]
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

Cypress.Commands.add('login', () => {
  // Get the user from the cookie
  return cy.getCookie('appSession.0').then((cookieValue) => {
    /* Skip logging in again if session already exists */
    if (cookieValue) return true
    cy.setCookie('appSession.0', Cypress.env('appSession0'))
    cy.setCookie('appSession.1', Cypress.env('appSession1'))
  })
})

before(() => {
  if (Cypress.env('authEnabled')) {
    cy.login()
    cy.visitHome()

    cy.contains(Cypress.env('username'))
    cy.contains(Cypress.env('accessGroup'))

    cy.findByRole('alert').should('not.exist')
  }
})
