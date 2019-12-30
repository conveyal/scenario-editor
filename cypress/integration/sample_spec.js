describe('Sample status check', () => {
  it('Loads base url', () => {
    cy.visit('/status')
    cy.screenshot()
  })
})
