// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands'
import 'cypress-file-upload'

// Persist the user cookie across sessions
Cypress.Cookies.defaults({
  whitelist: ['user']
})

Cypress.Commands.add('setupRegion', regionName => {
  // set up the named region if it doesn't already exist
  let name = 'autogen ' + regionName
  cy.visit('/')
  cy.get('body').then(body => {
    if (body.text().includes(name)) {
      cy.findByText(name).click()
      cy.location('pathname').should('match', /\/regions\/.{24}/)
    } else {
      cy.visit('/regions/create')
      cy.findByPlaceholderText('Region Name').type(name, {delay: 1})
      cy.fixture('regions/' + regionName + '.json').then(region => {
        cy.findByLabelText(/North bound/)
          .clear()
          .type(region.north, {delay: 1})
        cy.findByLabelText(/South bound/)
          .clear()
          .type(region.south, {delay: 1})
        cy.findByLabelText(/West bound/)
          .clear()
          .type(region.west, {delay: 1})
        cy.findByLabelText(/East bound/)
          .clear()
          .type(region.east, {delay: 1})
        // Select PBF file
        cy.fixture(region.PBFfile, {encoding: 'base64'}).then(fileContent => {
          cy.get('input[type="file"]').upload({
            encoding: 'base64',
            fileContent,
            fileName: region.PBFfile,
            mimeType: 'application/octet-stream'
          })
        })
      })
      cy.findByRole('button', {name: /Set up a new region/}).click()
      cy.location('pathname').should('match', /\/regions\/.{24}/)
    }
  })
})

Cypress.Commands.add('mapIsReady', () => {
  cy.window().should('have.property', 'LeafletMap')
  // map should have a tileLayer which is done loading
  cy.window().then(win => {
    win.LeafletMap.eachLayer(layer => {
      if (layer instanceof win.L.MapboxGL) {
        // TODO how to check if tiles are loaded??
        cy.log(layer)
      }
    })
  })
})

Cypress.Commands.add('login', function() {
  cy.getCookie('user').then(user => {
    const inTenMinutes = Date.now() + 600 * 1000
    const inOneHour = Date.now() + 3600 * 1000

    if (user) {
      const value = JSON.parse(decodeURIComponent(user.value))
      if (value.expiresAt > inTenMinutes) {
        cy.log('valid cookie exists, skip getting a new one')
        return
      }
    }

    cy.log('valid cookie does not exist, logging in ')
    cy.request({
      url: `https://${Cypress.env('authZeroDomain')}/oauth/ro`,
      method: 'POST',
      form: true,
      body: {
        client_id: Cypress.env('authZeroClientId'),
        grant_type: 'password',
        username: Cypress.env('username'),
        password: Cypress.env('password'),
        scope: 'openid email analyst',
        connection: 'Username-Password-Authentication'
      },
      timeout: 30000
    }).then(resp => {
      cy.setCookie(
        'user',
        encodeURIComponent(
          JSON.stringify({
            accessGroup: Cypress.env('accessGroup'),
            expiresAt: inOneHour,
            email: Cypress.env('username'),
            idToken: resp.body.id_token
          })
        ),
        {
          expiry: inOneHour
        }
      )
    })
  })
})
