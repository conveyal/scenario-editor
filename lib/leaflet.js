if (process.browser) {
  module.exports = require('leaflet')
} else {
  module.exports = {}
}
