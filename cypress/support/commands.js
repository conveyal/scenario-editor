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

// Persist the user cookie across sessions
Cypress.Cookies.defaults({
  whitelist: ['user']
})

Cypress.Commands.add('login', function() {
  cy.getCookie('user').then(user => {
    if (user) {
      cy.log('cookie exists, skip getting a new one')
      return
    } else {
      cy.log('cookie does not exists, logging in')
    }

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
      timeout: 5000
    }).then(resp => {
      cy.setCookie(
        'user',
        encodeURIComponent(
          JSON.stringify({
            accessGroup: Cypress.env('accessGroup'),
            expiresAt: new Date().getTime() + 3600,
            email: Cypress.env('username'),
            idToken: resp.body.id_token
          })
        )
      )
    })
  })
})
