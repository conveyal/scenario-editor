const unlog = {log: false}

// Shortened helper for `findByRole('button', {name: /Name/})
Cypress.Commands.add('findButton', (name) => cy.findByRole('button', {name}))

// Get a toast
Cypress.Commands.add('findToast', () =>
  cy.get('#chakra-toast-portal').findByRole('alert')
)

// Load the home page. Wait for the "Skeleton" to disappear
Cypress.Commands.add('visitHome', () => {
  cy.log('visitHome')
  cy.visit('/', {log: false})
  cy.get('#LoadingSkeleton', {log: false}).should('not.exist')
})

// No spinner
Cypress.Commands.add('loadingComplete', () => {
  cy.wait(1, {log: false}) // eslint-disable-line
  cy.waitUntil(() => Cypress.$('#sidebar-spinner').length === 0, {
    log: false,
    timeout: 15000
  })
})

// Wait until the page has finished loading
Cypress.Commands.add('navComplete', () => {
  Cypress.log({
    displayName: 'navComplete',
    message: 'waiting...'
  })
  return cy.waitUntil(() => Cypress.$('#sidebar-spinner').length === 0, {
    log: false,
    timeout: 15000
  })
})

// Check if a floating point number is within a certain tolerance
Cypress.Commands.add(
  'isWithin',
  {prevSubject: true},
  (f1: number, f2: number, tolerance = 0) => {
    Cypress.log({
      displayName: 'isWithin',
      message: `Math.abs(${f1} - ${f2}) <= ${tolerance}`
    })
    return cy.wrap(Math.abs(f1 - f2), unlog).should('be.lte', tolerance)
  }
)

// Get the numeric value of an input
Cypress.Commands.add('itsNumericValue', {prevSubject: true}, (subject) =>
  cy
    .wrap(subject, unlog)
    .invoke(unlog, 'val')
    .then((v: string) => {
      const value = Number(v?.replace(',', ''))
      Cypress.log({displayName: 'itsNumericValue', message: value})
      return value
    })
)

// Get the numeric text of an input
Cypress.Commands.add('itsNumericText', {prevSubject: true}, (subject) =>
  cy
    .wrap(subject, unlog)
    .invoke(unlog, 'text')
    .then((v: string) => {
      const value = Number(v?.replace(',', ''))
      Cypress.log({displayName: 'itsNumericText', message: value})
      return value
    })
)

const navToPages = {
  regions: {
    lookFor: /Set up a new region/i,
    path: /\//
  },
  projects: {
    lookFor: /Create new Project|Upload a .* Bundle/i,
    path: /\/regions\/[a-z0-9]+/
  },
  'network bundles': {
    lookFor: /Create a new network bundle/i,
    path: /\/regions\/[a-z0-9]+\/bundles/
  },
  'spatial datasets': {
    lookFor: /Upload a new dataset/i,
    path: /\/regions\/[a-z0-9]+\/opportunities*/
  },
  'edit modifications': {
    lookFor: /create a modification/i,
    path: /\/regions\/[a-z0-9]+\/projects*/
  },
  analyze: {
    lookFor: /Fetch results/i,
    path: /\/regions\/[a-z0-9]+\/analysis*/
  },
  'regional analyses': {
    lookFor: /Regional Analyses/i,
    path: /\/regions\/[a-z0-9]+\/regional*/
  }
}

/**
 * Guidance taken from https://www.cypress.io/blog/2020/08/17/when-can-the-test-navigate/
 */
Cypress.Commands.add('navTo', (menuItemTitle) => {
  const title = menuItemTitle.toLowerCase()
  Cypress.log({displayName: 'navTo:start', message: title})
  // Ensure that any previous navigation is complete before attempting to navigate again
  cy.navComplete()
  // Navigate to a page using one of the main (leftmost) menu items
  // and wait until at least part of the page is loaded.
  const page = navToPages[title]
  // click the menu item
  cy.get('#sidebar', unlog)
    .findByRole('button', {name: RegExp(title, 'i')})
    .click(unlog)
  // Ensure the pathname has updated to the correct path
  cy.location('pathname', unlog).should('match', page.path, unlog)
  // check that page loads at least some content
  cy.contains(page.lookFor, {log: false, timeout: 16000}).should('exist')
  // Ensure the spinner has stopped loading before continuing
  return cy
    .navComplete()
    .then(() => Cypress.log({displayName: 'navTo:complete', message: title}))
})

Cypress.Commands.add('login', function () {
  cy.getCookie('a0:state').then((cookie) => {
    // If the cookie already exists, skip the login
    if (cookie) return

    cy.visit('/')
    cy.findByLabelText('Email').type(Cypress.env('username'))
    cy.findByLabelText('Password').type(Cypress.env('password'))
    cy.findByRole('button', {name: 'Log In'}).click()

    // Should show the home page
    cy.findByText(new RegExp(Cypress.env('username')))
  })
})
