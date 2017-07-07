const uuid = require.requireActual('uuid')

module.exports = {
  ...uuid,
  v4: () => '00000000-0000-0000-0000-000000000000'
}
