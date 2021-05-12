// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import {addMatchImageSnapshotPlugin} from 'cypress-image-snapshot/plugin'
import fs from 'fs'

export default function initializePlugins(on, config) {
  addMatchImageSnapshotPlugin(on, config)

  // used to create the pseudoFixture file
  on('task', {
    ensureExists(filename: string, contents = '{}') {
      if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, contents)
      }
      return null
    }
  })
  return config
}
