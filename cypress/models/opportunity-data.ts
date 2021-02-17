import Model from './model'

export default class OpportunityData extends Model {
  filePath: string

  constructor(parentName: string, name: string, filePath: string) {
    super(parentName, name, 'opportunityDataset')
    this.filePath = filePath
  }

  _delete() {
    cy.findButton(/Delete entire dataset/i).click()
    cy.findButton(/Confirm: Delete entire dataset/i).click()
  }

  findOrCreate() {
    // Check for the existing ods
    cy.navTo('spatial datasets')
    cy.findByText(/Select\.\.\./)
      .click()
      .type(`${this.name} {enter}`)
    cy.navComplete()
    cy.location('href').then((href) => {
      if (!href.match(/.*DatasetId=\w{24}$/)) {
        cy.createOpportunityDataset(this.name, this.filePath)
      }
    })
    cy.location('href')
      .should('match', /.*DatasetId=\w{24}$/)
      .then((href) => {
        this.path = href
      })
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
