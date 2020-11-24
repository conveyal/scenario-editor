import Model from './model'

export default class Modification extends Model {
  path: string

  delete() {
    this.navTo()
    cy.findByRole('button', {name: /Delete modification/}).click()
    cy.findByRole('button', {name: /Confirm: Delete modification/}).click()
    cy.navComplete()
  }

  navTo() {
    cy.navComplete()
    cy.location('pathname').then((path) => {
      if (path !== this.path) {
        cy.visit(this.path)
        cy.navComplete()
      }
    })
  }
}
