import Model from './model'

export default class OpportunityData extends Model {
  delete() {
    this.navTo()
    // window.confirm is auto-confirmed by Cypress
    cy.findByRole('button', {name: /Delete entire dataset/i}).click()
    cy.navComplete()
  }

  navTo() {
    cy.navComplete()
    cy.location('href').then((href) => {
      if (href !== this.path) {
        cy.visit(this.path)
        cy.navComplete()
      }
    })
  }

  select() {
    cy.findByLabelText(/^Opportunity Dataset$/) // eslint-disable-line cypress/no-unnecessary-waiting
      .click({force: true})
      .type(`${this.name}{enter}`, {delay: 0})
      .wait(100)
    cy.findByLabelText(/^Opportunity Dataset$/).should('be.enabled')
  }
}
