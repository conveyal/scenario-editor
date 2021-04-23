import Model from './model'

export default class Bundle extends Model {
  date: string
  gtfsFilePath: string
  osmFilePath: string

  constructor(
    parentKey: string,
    name: string,
    date: string,
    gtfsFilePath: string,
    osmFilePath: string
  ) {
    super(parentKey, name, 'bundle')
    this.date = date
    this.gtfsFilePath = gtfsFilePath
    this.osmFilePath = osmFilePath
  }

  _delete() {
    cy.findButton(/Delete this network bundle/).click()
    cy.findButton(/Confirm/).click()
    cy.findByRole('alertdialog').should('not.exist')
    cy.wait(1_000) // eslint-disable-line
  }

  findOrCreate() {
    // Check for the existing bundle. If it does not exist, create one.
    cy.navTo('network bundles')
    cy.findByLabelText(/or view an existing one/)
      .click({force: true})
      .type(this.name + '{enter}')
    cy.navComplete()
    cy.location('pathname').then((path) => {
      if (!path.match(/bundles\/\w{24}$/)) {
        // Does not exist, create the bundle
        cy.createBundle(this.name, this.gtfsFilePath, this.osmFilePath)
      }
    })
    cy.location('pathname')
      .should('match', /bundles\/\w{24}$/)
      .then((path) => {
        this.path = path
      })
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
