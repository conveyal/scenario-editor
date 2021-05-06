describe('Logging in', () => {
  it('should login', () => {
    cy.login()

    // Now run your test...
    cy.request('/api/auth/me').then(({body: user}) => {
      Object.keys(user).forEach((k) => cy.log(`${k}: ${user[k]}`))
      expect(user.email).to.equal(Cypress.env('auth0Username'))
      expect(user.accessGroup).to.equal(Cypress.env('accessGroup'))
      expect(user.idToken).not.to.be.undefined
    })

    cy.visitHome()
    cy.contains(Cypress.env('auth0Username'))
    cy.contains(Cypress.env('accessGroup'))
  })
})
