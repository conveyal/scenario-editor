const {PHASE_PRODUCTION_BUILD} = require('next/constants')

const withMDX = require('@zeit/next-mdx')({
  extension: /\.mdx?$/
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const path = require('path')
const webpack = require('webpack')

if (process.env.API_URL === undefined) {
  require('dotenv').config({path: '.env.build'})
}

// Add defaults for AUTH0 if auth is disabled
const AUTH_DISABLED = process.env.AUTH_DISABLED === 'true'

const env = {
  ADMIN_ACCESS_GROUP: process.env.ADMIN_ACCESS_GROUP || 'conveyal',
  API_URL: process.env.API_URL || 'http://localhost:3000',
  AUTH_DISABLED,
  AUTH0_CLIENT_ID: AUTH_DISABLED ? 'unrequired' : process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: AUTH_DISABLED ? 'unrequired' : process.env.AUTH0_DOMAIN,
  LOGROCKET: process.env.LOGROCKET || false,
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN
}

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    if (Object.values(env).find(v => v === undefined || v === null)) {
      console.error(
        ```
Please ensure required environment variables can be found. If running locally,
copy '.env.build.tmp' to '.env.build' and ensure following variables are set:
${Object.keys(env).join(', ')}
```
      )
      process.exit(1)
    }
  }

  return withMDX(
    withBundleAnalyzer({
      target: 'serverless',
      pageExtensions: ['js', 'jsx', 'mdx'],
      env,
      webpack: config => {
        // Allow `import 'lib/message'`
        config.resolve.alias['lib'] = path.join(__dirname, 'lib')

        // ESLint on build
        config.module.rules.push({
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })

        // Ignore moment locales
        config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))

        return config
      }
    })
  )
}
