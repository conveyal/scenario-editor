export function mockComponents (components) {
  if (Array.isArray(components)) {
    const mockedComponents = {}
    for (let i = 0; i < components.length; i++) {
      const name = components[i]
      mockedComponents[name] = name
    }
    return mockedComponents
  }
}
