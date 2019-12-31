describe('Login Command', () => {
  before(() => {
    cy.login()
  })

  it('should log the user in behind the scenes and set the cookie', () => {
    cy.login()
    cy.getCookie('user').should('exist')
    cy.visit('/')
  })

  it('should persist the cookie', () => {
    cy.getCookie('user').should('exist')
  })
})
