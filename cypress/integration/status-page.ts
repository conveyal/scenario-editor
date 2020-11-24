describe('/status', function () {
  it('should run', function () {
    cy.visit('/status')
    cy.findAllByText('OK').should('have.length', 2)
  })
})
