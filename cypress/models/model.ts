export default abstract class Model {
  name: string
  path: string // For navigating

  constructor(name: string) {
    this.name = Cypress.env('dataPrefix') + name
  }

  abstract delete(): void

  abstract navTo(): void
}
