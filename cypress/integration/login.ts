if (Cypress.env('authEnabled')) {
  describe('Logging in', () => {
    it('should be logged in', () => {
      // Now run your test...
      cy.request('/api/auth/me').then(({body: user}) => {
        expect(user['http://conveyal/accessGroup']).to.equal(
          Cypress.env('accessGroup')
        )
        expect(user.idToken).not.to.be.undefined
      })

      cy.visitHome()
      cy.contains(Cypress.env('accessGroup'))
    })
  })
}
