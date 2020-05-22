import '@testing-library/cypress/add-commands'
import 'cypress-file-upload'

// Persist the user cookie across sessions
Cypress.Cookies.defaults({
  whitelist: ['user']
})

function pseudoFixture(regionName) {
  // this is a file used to store randomly generated UUIDs associated with
  // objects in order to look them up efficiently across tests without resorting
  // to unecessary UI interaction in the 'before' hook
  return `cypress/fixtures/regions/.${regionName}.json`
}

Cypress.Commands.add('setupRegion', (regionName) => {
  // set up the named region from fixtures if necessary
  cy.task('touch', pseudoFixture(regionName))
  cy.readFile(pseudoFixture(regionName), {log: false}).then((IDs) => {
    if ('regionId' in IDs) {
      cy.visit(`/regions/${IDs.regionId}`)
      cy.contains(/Create new Project|Upload a .* Bundle/i)
    } else {
      createNewRegion(regionName)
    }
  })
})

function createNewRegion(regionName) {
  cy.visit('/regions/create')
  cy.findByPlaceholderText('Region Name').type(regionName, {delay: 1})
  cy.fixture('regions/' + regionName + '.json').then((region) => {
    cy.findByLabelText(/North bound/)
      .clear()
      .type(region.north, {delay: 1})
    cy.findByLabelText(/South bound/)
      .clear()
      .type(region.south, {delay: 1})
    cy.findByLabelText(/West bound/)
      .clear()
      .type(region.west, {delay: 1})
    cy.findByLabelText(/East bound/)
      .clear()
      .type(region.east, {delay: 1})
  })
  cy.findByRole('button', {name: /Set up a new region/}).click()
  cy.contains(/Upload a new network bundle|create new project/i)
  // store the region UUID for later
  cy.location('pathname')
    .should('match', /regions\/\w{24}$/)
    .then((path) => {
      let matches = path.match(/(?:\/regions\/)(?<uuid>\w{24})/)
      cy.writeFile(pseudoFixture(regionName), {regionId: matches.groups.uuid})
    })
}

Cypress.Commands.add('setupBundle', (regionName) => {
  cy.task('touch', pseudoFixture(regionName))
  cy.readFile(pseudoFixture(regionName)).then((IDs) => {
    if ('bundleId' in IDs) {
      cy.visit(`/regions/${IDs.regionId}/bundles/${IDs.bundleId}`)
      cy.contains(/create a new network bundle/i)
    } else if ('regionId' in IDs) {
      // no bundle, but region exists
      cy.visit(`/regions/${IDs.regionId}/bundles`)
      createNewBundle(regionName)
    } else {
      cy.setupRegion(regionName)
      cy.setupBundle(regionName)
    }
  })
})

function createNewBundle(regionName) {
  let bundleName = regionName + ' bundle'
  cy.findByText(/Create .* bundle/).click()
  cy.location('pathname').should('match', /\/bundles\/create$/)
  cy.findByLabelText(/Network bundle name/i).type(bundleName, {delay: 1})
  cy.findByText(/Upload new OpenStreetMap/i).click()
  cy.fixture('regions/' + regionName + '.json').then((region) => {
    cy.fixture(region.PBFfile, {encoding: 'base64'}).then((fileContent) => {
      cy.findByLabelText(/Select PBF file/i).upload({
        fileContent,
        fileName: region.PBFfile,
        encoding: 'base64',
        mimeType: 'application/octet-stream'
      })
    })
    cy.findByText(/Upload new GTFS/i).click()
    cy.fixture(region.GTFSfile, {encoding: 'base64'}).then((fileContent) => {
      cy.findByLabelText(/Select .*GTFS/i).upload({
        fileContent,
        fileName: region.GTFSfile,
        encoding: 'base64',
        mimeType: 'application/octet-stream'
      })
    })
  })
  cy.findByRole('button', {name: /Create/i}).click()
  cy.findByText(/Processing/)
  cy.findByText(/Processing/, {timeout: 30000}).should('not.exist')
  // go back and grab the UUID
  cy.navTo('Network Bundles')
  cy.findByText(/Select.../)
    .parent()
    .click()
    .type(bundleName + '{enter}')
  cy.location('pathname')
    .should('match', /bundles\/\w{24}$/)
    .then((path) => {
      let matches = path.match(/\w{24}$/)
      cy.readFile(pseudoFixture(regionName)).then((contents) => {
        contents = {...contents, bundleId: matches[0]}
        cy.writeFile(pseudoFixture(regionName), contents, {log: false})
      })
    })
}

Cypress.Commands.add('setupProject', (regionName) => {
  cy.task('touch', pseudoFixture(regionName))
  cy.readFile(pseudoFixture(regionName), {log: false}).then((IDs) => {
    if ('projectId' in IDs) {
      cy.visit(`/regions/${IDs.regionId}/projects/${IDs.projectId}`)
      cy.contains(/Create a modification/i)
    } else if ('bundleId' in IDs) {
      cy.visit(`/regions/${IDs.regionId}/projects`)
      createNewProject(regionName)
    } else {
      cy.setupBundle(regionName)
      cy.setupProject(regionName)
    }
  })
})

function createNewProject(regionName) {
  let projectName = regionName + ' project'
  let bundleName = regionName + ' bundle'
  cy.contains('Create new Project')
  cy.findByText(/Create new Project/i).click()
  cy.location('pathname').should('match', /\/create-project/)
  cy.findByLabelText(/Project name/).type(projectName, {delay: 1})
  cy.findByLabelText(/Associated network bundle/i).click()
  cy.findByText(bundleName).click()
  cy.get('a.btn')
    .contains(/Create/)
    .click()
  cy.contains(/Modifications/, {log: false})
  // store the projectId
  cy.location('pathname', {log: false})
    .should('match', /\/projects\/\w{24}$/)
    .then((path) => {
      let projectId = path.match(/\w{24}$/)[0]
      cy.readFile(pseudoFixture(regionName), {log: false}).then((contents) => {
        contents = {...contents, projectId: projectId}
        cy.writeFile(pseudoFixture(regionName), contents, {log: false})
      })
    })
}

Cypress.Commands.add('deleteProject', (projectName) => {
  cy.navTo('Projects')
  cy.get('body').then((body) => {
    if (body.text().includes(projectName)) {
      cy.findByText(projectName).click()
      cy.get('svg[data-icon="cog"]').click()
      cy.findByText(/Delete project/i).click()
    } else {
      // no such project - nothing to delete
    }
  })
})

Cypress.Commands.add('setupMod', (modType, modName) => {
  cy.navTo(/Edit Modifications/)
  // assumes we are already on this page or editing another mod
  cy.findByRole('link', {name: 'Create a modification'}).click()
  cy.findByLabelText(/Modification type/i).select(modType)
  cy.findByLabelText(/Modification name/i).type(modName)
  cy.findByRole('link', {name: 'Create'}).click()
  cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
})

Cypress.Commands.add('openMod', (modType, modName) => {
  // opens the first listed modification of this type with this name
  cy.navTo(/Edit Modifications/)
  // find the container for this modification type and open it if need be
  cy.contains(modType)
    .parent()
    .as('modList')
    .then((modList) => {
      if (!modList.text().includes(modName)) {
        cy.get(modList).click()
      }
    })
  cy.get('@modList').contains(modName).click()
  cy.location('pathname').should('match', /.*\/modifications\/.{24}$/)
  cy.contains(modName)
})

Cypress.Commands.add('deleteMod', (modType, modName) => {
  cy.openMod(modType, modName)
  cy.get('a[name="Delete modification"]').click()
  cy.location('pathname').should('match', /.*\/projects\/.{24}$/)
  cy.contains('Create a modification')
  cy.findByText(modName).should('not.exist')
})

Cypress.Commands.add('deleteThisMod', () => {
  cy.get('a[name="Delete modification"]').click()
  cy.location('pathname').should('match', /.*\/projects\/.{24}$/)
  cy.contains(/Create a modification/)
})

Cypress.Commands.add('setupScenario', (scenarioName) => {
  // can be called when editing modifications
  cy.navTo('Edit Modifications')
  cy.contains('Scenarios')
    .parent()
    .as('panel')
    .then((panel) => {
      // open the scenario panel if it isn't open already
      if (!panel.text().includes('Create a scenario')) {
        cy.get(panel).click()
        cy.get(panel).contains('Create a scenario')
      }
    })
  cy.get('@panel').then((panel) => {
    // create scenario if it doesn't already exist
    if (!panel.text().includes(scenarioName)) {
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns(scenarioName)
      })
      cy.findByRole('link', {name: 'Create a scenario'}).click()
      cy.window().then((win) => {
        win.prompt.restore()
      })
    }
  })
})

Cypress.Commands.add('deleteScenario', (scenarioName) => {
  // can be called when editing modifications
  cy.navTo('Edit Modifications')
  // open the scenario panel if it isn't already
  cy.contains('Scenarios')
    .parent()
    .as('panel')
    .then((panel) => {
      if (!panel.text().includes('Create a scenario')) {
        cy.get(panel).click()
      }
    })
  cy.get('@panel')
    .contains(scenarioName)
    .findByTitle(/Delete this scenario/)
    .click()
})

Cypress.Commands.add('navTo', (menuItemTitle) => {
  // Navigate to a page using one of the main (leftmost) menu items
  // attempt to wait until at least part of the desired page is loaded
  Cypress.log({name: 'Navigate to'})
  let caseInsensitiveTitle = RegExp(menuItemTitle, 'i')
  cy.findByTitle(caseInsensitiveTitle, {log: false})
    .parent({log: false}) // select actual SVG element rather than <title> el
    .click({log: false})
  switch (caseInsensitiveTitle.toString()) {
    case /Regions/i.toString():
      cy.contains(/conveyal analysis/i, {log: false})
      cy.contains(/Set up a new region/i, {log: false})
      break
    case /Region Settings/i.toString():
      cy.contains(/Delete this region/i, {log: false})
      break
    case /Projects/i.toString():
      cy.contains(/Create new Project|Upload a .* Bundle/i, {log: false})
      break
    case /Network Bundles/i.toString():
      cy.contains(/Create a new network bundle/i, {log: false})
      break
    case /Opportunity datasets/i.toString():
      cy.contains(/Upload a new dataset/i, {log: false})
      break
    case /Edit Modifications/i.toString():
      cy.contains(/create new project|create a modification/i, {log: false})
      break
    case /Analyze/i.toString():
      cy.location('pathname', {log: false}).should('match', /\/analysis/, {
        log: false
      })
      cy.contains(/Comparison Project/i, {log: false})
      break
  }
})

Cypress.Commands.add('clickMap', (coord) => {
  console.assert('lat' in coord && 'lon' in coord)
  cy.window()
    .its('LeafletMap')
    .then((map) => {
      let pix = map.latLngToContainerPoint([coord.lat, coord.lon])
      cy.get('div.leaflet-container').click(pix.x, pix.y)
    })
})

Cypress.Commands.add('waitForMapToLoad', () => {
  cy.window()
    .its('LeafletMap')
    .then((map) => {
      // this just does not seem to work as expected. The wait remains necessary
      cy.wrap(map).its('_loaded').should('be.true')
      //cy.wrap(map).its('_renderer').its('_drawing').should('be.false')
      cy.wait(500) // eslint-disable-line cypress/no-unnecessary-waiting
    })
})

Cypress.Commands.add('mapCenteredOn', (latLonArray, tolerance) => {
  cy.window()
    .its('LeafletMap')
    .then((map) => {
      cy.wrap(map.distance(map.getCenter(), latLonArray)).should(
        'be.lessThan',
        tolerance
      )
    })
})

Cypress.Commands.add('mapContainsRegion', (regionName) => {
  cy.fixture('regions/' + regionName + '.json').then((region) => {
    cy.window()
      .its('LeafletMap')
      .then((map) => {
        cy.wrap(
          map.getBounds().contains([
            [region.north, region.east],
            [region.south, region.west]
          ])
        ).should('be.true')
      })
  })
})

Cypress.Commands.add('mapMoveMarkerTo', (latLonArray) => {
  cy.window()
    .its('LeafletMap')
    .then((map) => {
      // find the marker
      var marker
      for (let key in map._layers) {
        let layer = map._layers[key]
        // only the marker layer has this set, though...
        // TODO there is probably a surer way to get the marker
        if (typeof layer.getLatLng === 'function') {
          marker = map.latLngToContainerPoint(layer.getLatLng())
          cy.log('move from ' + marker)
        }
      }
      // project to screen coordinates
      let dest = map.latLngToContainerPoint(latLonArray)
      cy.log('move to ' + dest)
      // TODO marker drag not working yet
      cy.get('.leaflet-container')
        .trigger('mousedown', {
          which: 1,
          clientX: marker.x + 680,
          clientY: marker.y
        })
        .trigger('mousemove', {
          which: 1,
          clientX: dest.x + 680,
          clientY: dest.y
        })
        .trigger('mouseup')
    })
})

Cypress.Commands.add('login', function () {
  cy.getCookie('user').then((user) => {
    const inTenMinutes = Date.now() + 600 * 1000
    const inOneHour = Date.now() + 3600 * 1000

    if (user) {
      const value = JSON.parse(decodeURIComponent(user.value))
      if (value.expiresAt > inTenMinutes) {
        cy.log('valid cookie exists, skip getting a new one')
        return
      }
    }

    cy.log('valid cookie does not exist, logging in ')
    cy.request({
      url: `https://${Cypress.env('authZeroDomain')}/oauth/ro`,
      method: 'POST',
      form: true,
      body: {
        client_id: Cypress.env('authZeroClientId'),
        grant_type: 'password',
        username: Cypress.env('username'),
        password: Cypress.env('password'),
        scope: 'openid email analyst',
        connection: 'Username-Password-Authentication'
      },
      timeout: 30000
    }).then((resp) => {
      cy.setCookie(
        'user',
        encodeURIComponent(
          JSON.stringify({
            accessGroup: Cypress.env('accessGroup'),
            expiresAt: inOneHour,
            email: Cypress.env('username'),
            idToken: resp.body.id_token
          })
        ),
        {
          expiry: inOneHour
        }
      )
    })
  })
})

import {addMatchImageSnapshotCommand} from 'cypress-image-snapshot/command'

addMatchImageSnapshotCommand()
