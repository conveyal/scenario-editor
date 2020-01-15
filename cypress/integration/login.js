describe('Login Command', () => {
  before(() => {
    cy.login()
  })

  it('should log the user in behind the scenes and set the cookie', () => {
    cy.login()
    cy.getCookie('user').should('exist')
    cy.visit('/')

    cy.contains(Cypress.env('username'))
    cy.contains(Cypress.env('accessGroup'))
  })

  it('should persist the cookie between tests', () => {
    cy.getCookie('user').should('exist')
  })
})
