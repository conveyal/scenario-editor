type ModelType =
  | 'bundle'
  | 'modification'
  | 'opportunityDataset'
  | 'project'
  | 'region'
  | 'regionalAnalysis'

/**
 * Override local storage clearing to maintain paths for created models.
 */
const localStorageKey = 'localModelPaths'
const clearLocalStorage = Cypress.LocalStorage.clear
Cypress.LocalStorage.clear = function (keys) {
  clearLocalStorage(keys.filter((k) => k !== localStorageKey))
}

export default abstract class Model {
  parentKey: string
  name: string
  path: string // For navigating
  modelType: ModelType

  constructor(parentKey: string, name: string, type: ModelType) {
    this.parentKey = parentKey
    this.name = Cypress.env('dataPrefix') + name
    this.modelType = type
  }

  static clearAllStoredPaths() {
    cy.window().then((win) => {
      win.localStorage.removeItem(localStorageKey)
    })
  }

  clearPath(): void {
    cy.window({log: false}).then((win) => {
      const paths = JSON.parse(
        win.localStorage.getItem(localStorageKey) ?? '{}'
      )
      delete paths[this.key]
      win.localStorage.setItem(localStorageKey, JSON.stringify(paths))
    })
  }

  delete(): void {
    this.navTo()
    this.clearPath()
    this._delete()
    cy.navComplete()
  }

  abstract _delete(): void

  abstract findOrCreate(): void

  abstract navTo(): void

  get key(): string {
    return `${this.parentKey}:${this.modelType}:${this.name}`
  }

  initialize() {
    this.isPathStored().then((pathIsStored) => {
      if (!pathIsStored) {
        this.findOrCreate() // sets the path
        this.storePath() // store the path to be reused
        cy.navComplete() // ensure navigation is complete before continuing
      }
    })
  }

  /**
   * Check if the path is stored. Run in `before` statements
   */
  isPathStored(): Cypress.Chainable<boolean> {
    return cy.window({log: false}).then((win) => {
      const pathsString = win.localStorage.getItem(localStorageKey)
      if (typeof pathsString !== 'string') return false
      const paths = JSON.parse(pathsString)
      if (paths[this.key]) {
        this.path = paths[this.key]
        return true
      }
      return false
    })
  }

  /**
   * Store the path
   */
  storePath() {
    cy.window({log: false}).then((win) => {
      const paths = JSON.parse(
        win.localStorage.getItem(localStorageKey) ?? '{}'
      )
      win.localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          ...paths,
          [this.key]: this.path
        })
      )
    })
  }
}
