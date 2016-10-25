const path = require('path')

const bufferEq = require('buffer-equal-constant-time')
const fs = require('fs-extra')
const rimraf = require('rimraf')

const projectDir = path.resolve(__dirname, '../../')
const settingsDir = `${projectDir}/configurations/default/`
const envYml = `${settingsDir}env.yml`
const testYml = `${settingsDir}env.yml.test`
const movedOriginal = `${envYml}-original`

if (process.argv[2] === 'setup') {
  // move existing env.yml file if it exists and is different than test file
  if (fs.existsSync(envYml) && !bufferEq(fs.readFileSync(envYml), fs.readFileSync(testYml))) {
    fs.copySync(envYml, movedOriginal)
  }

  // replace env.yml file with test file
  rimraf.sync(envYml)
  fs.copySync(testYml, envYml)
} else if (process.argv[2] === 'teardown') {
  // remove env.yml file
  rimraf.sync(envYml)

  // restore original if it exists, or remove env.yml file otherwise
  if (fs.existsSync(movedOriginal)) {
    fs.copySync(movedOriginal, envYml)
    // remove old file
    rimraf.sync(movedOriginal)
  } else {
    rimraf.sync(envYml)
  }
}
