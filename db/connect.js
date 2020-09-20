const mongodb = require('mongodb')

const defaultDB = process.env.MONGODB_DB || 'analysis'
const MongoClient = mongodb.MongoClient

function connect(url = process.env.MONGODB_URL) {
  return new Promise((resolve, reject) => {
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    client.connect((err) => {
      if (err) return reject(err)
      resolve(client)
    })
  })
}

module.exports = connect

// Helper function for getting the default database
module.exports.getDB = function getDb(dbName = defaultDB) {
  return connect().then((client) => client.db(dbName))
}
