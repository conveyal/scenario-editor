import Model from './model'
import Project from './project'
import Region from './region'

export type RegionalAnalysisOptions = {
  project?: Project
  scenario?: string
  settings?: Record<string, unknown>
  opportunityDatasets?: string[]
  originPointSet?: string
  cutoffs?: number[]
  percentiles?: number[]
}

export default class RegionalAnalysis extends Model {
  options: RegionalAnalysisOptions
  opportunityDatasets: string[]
  region: Region

  constructor(
    parentKey: string,
    name: string,
    opportunityDatasets: string[],
    options: RegionalAnalysisOptions,
    region: Region
  ) {
    super(parentKey, name, 'regionalAnalysis')
    this.options = options
    this.opportunityDatasets = opportunityDatasets
    this.region = region
  }

  _delete() {
    cy.findByRole('button', {name: /Delete/}).click()
    cy.findButton(/Confirm/).click()
  }

  findOrCreate() {
    cy.navTo('regional analyses')
    cy.findByText(/View a regional analysis/)
      .click()
      .type(`${this.name}{enter}`)

    cy.location('href').then((href) => {
      if (!href.match(/analysisId=\w{24}/)) {
        this.region.setupAnalysis(this.options)

        cy.fetchResults()

        cy.createRegionalAnalysis(
          this.name,
          this.opportunityDatasets,
          this.options
        )
      }

      cy.location('href')
        .should('match', /.*analysisId=\w{24}$/)
        .then((href) => {
          this.path = href
        })
    })
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
