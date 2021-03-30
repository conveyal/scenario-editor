module.exports = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  productionBrowserSourceMaps: true,
  async redirects() {
    return [{
      source: '/changelog',
      destination: 'https://docs.conveyal.com/changelog',
      permanent: false
    }]
  }
}
