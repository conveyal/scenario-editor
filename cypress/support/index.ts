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
import 'cypress-nextjs-auth0'
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
    'appSession',
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

beforeEach(() => {
  if (Cypress.env('authEnabled')) {
    cy.login().then(() => {
      cy.visitHome()

      cy.contains(Cypress.env('auth0Username'))
      cy.contains(Cypress.env('accessGroup'))

      cy.findByRole('alert').should('not.exist')

      // Override the user on the window object
      cy.window().then((win) => {
        win['__user'] = {
          accessGroup: Cypress.env('accessGroup'),
          adminTempAccessGroup: null,
          email: Cypress.env('auth0Username'),
          idToken: Cypress.env('auth0IdToken')
        }
      })
    })
  }
})
