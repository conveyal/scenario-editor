import Bundle from './bundle'
import Model from './model'
import Modification from './modification'

type ModificationProps = {
  data?: Record<string, unknown>
  onCreate?: () => void
  name?: string
  type: Cypress.ModificationType
}

export default class Project extends Model {
  bundle: Bundle
  modificationNames: Set<string> = new Set()

  constructor(parentKey: string, name: string, bundle: Bundle) {
    super(parentKey, name, 'project')
    this.bundle = bundle
  }

  _delete() {
    cy.findByLabelText('Edit project settings').click()
    cy.navComplete()
    cy.findByText(/Delete project/i).click()
    cy.findByRole('button', {name: /Confirm: Delete project/i}).click()
  }

  deleteModification(modificationName: string) {
    this.navTo()
    // Create if it does not exist
    cy.findAllByRole('button').then((buttons) => {
      const pb = buttons.filter((_, el) => el.textContent === modificationName)
      if (pb.length !== 0) {
        cy.wrap(pb.first()).click()
        cy.findByRole('button', {name: /Delete modification/}).click()
        cy.findByRole('button', {name: /Confirm: Delete modification/}).click()
        cy.navComplete()
      }
    })
  }

  // Create a project if it does not exist.
  findOrCreate() {
    cy.navTo('projects')
    cy.get('button').then((buttons) => {
      const pb = buttons.filter((_, el) => el.textContent === this.name)
      if (pb.length === 0) {
        cy.findByText(/Create new Project/i).click()
        cy.findByLabelText(/Project name/).type(this.name)
        cy.findByLabelText(/Associated network bundle/i)
          .click({force: true})
          .type(this.bundle.name + '{enter}')
        cy.findByText(/^Create$/).click()
      } else {
        cy.wrap(pb.first()).click()
      }

      // Store the project id
      cy.location('pathname')
        .should('match', /regions\/\w{24}\/projects\/\w{24}\/modifications$/)
        .then((path) => {
          this.path = path
        })
    })
  }

  getModification({
    data,
    onCreate,
    name,
    type
  }: ModificationProps): Modification {
    name ??= type + this.modificationNames.size
    if (this.modificationNames.has(name)) {
      throw new Error('Modification name must be unique per project')
    } else {
      this.modificationNames.add(name)
    }
    const modification = new Modification(this.key, name, type, onCreate)

    before(`getModification(${modification.name})`, () => {
      this.navTo()
      modification.initialize()

      // On each test run ensure it starts with the same data.
      if (data) {
        modification.navTo()
        cy.editModificationJSON(data)
      }
    })

    return modification
  }

  // Helper for setting up a scenarios in this project.
  getScenarios(scenarios: string[]) {
    before('getScenarios', () => {
      this.navTo()
      cy.findByRole('tab', {name: 'Scenarios'}).click()
      scenarios.forEach((scenarioName) => {
        cy.get('#scenarios').then((el) => {
          // create named scenario if it doesn't already exist
          if (!el.text().includes(scenarioName)) {
            cy.findByRole('button', {name: 'Create a scenario'}).click()
            cy.loadingComplete()
            // TODO there has GOT to be a better way...
            cy.get('#scenarios').findAllByRole('group').last().click()

            cy.focused()
              .clear()
              .type(scenarioName + '{enter}')
          }
        })
      })
    })
  }

  navTo() {
    cy.navComplete()
    cy.location('pathname').then((path) => {
      if (path === this.path) {
        cy.findByRole('tab', {name: /Modifications/}).click()
      } else {
        cy.visit(this.path)
        cy.navComplete()
      }
    })
  }
}
