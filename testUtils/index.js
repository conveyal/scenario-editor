export function mockComponents (components) {
  if (components instanceof Array) {
    const mockedComponents = {}
    for (let i = 0; i < components.length; i++) {
      const name = components[i]
      mockedComponents[name] = name
    }
    return mockedComponents
  }
}
