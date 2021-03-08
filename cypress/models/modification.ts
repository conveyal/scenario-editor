import Model from './model'

const typeUsesFeed = new Set([
  'Adjust Dwell Time',
  'Adjust Speed',
  'Convert To Frequency',
  'Remove Stops',
  'Remove Trips',
  'Reroute'
])

export default class Modification extends Model {
  onCreate: () => void
  path: string
  type: Cypress.ModificationType

  constructor(
    parentKey: string,
    name: string,
    type: Cypress.ModificationType,
    onCreate: () => void
  ) {
    super(parentKey, name, 'modification')
    this.onCreate = onCreate
    this.type = type
  }

  _delete() {
    cy.findByRole('button', {name: /Delete modification/}).click()
    cy.findButton(/Confirm/).click()
  }

  findOrCreate() {
    // Create if it does not exist
    cy.findAllByRole('button').then((buttons) => {
      const pb = buttons.filter((_, el) => el.textContent === this.name)
      if (pb.length === 0) {
        cy.createModification(this.type, this.name)

        // Set the first route by default
        if (typeUsesFeed.has(this.type)) {
          cy.findByLabelText(/Select route/)
            .click({force: true})
            .type('{enter}', {delay: 0})
          cy.loadingComplete()
        }

        // If it has a special onCreate function, run it
        if (this.onCreate) this.onCreate()
      } else {
        cy.wrap(pb.first()).click()
        cy.navComplete()
        cy.findByText(this.name)
      }

      // Store the modification path
      cy.location('pathname')
        .should('match', /projects\/\w{24}\/modifications\/\w{24}$/)
        .then((path) => {
          this.path = path
        })
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
