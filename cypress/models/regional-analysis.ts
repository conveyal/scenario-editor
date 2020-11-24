import Model from './model'

export default class RegionalAnalysis extends Model {
  delete() {
    this.navTo()
    cy.findByRole('button', {name: /Delete/}).click()
    cy.findByRole('button', {name: /Confirm: Delete regional analysis/}).click()
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
}
