# Analysis UI
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fconveyal%2Fanalysis-ui.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fconveyal%2Fanalysis-ui?ref=badge_shield)


Conveyal's tools for editing land-use/transportation scenarios.

## Configuration

### [Analysis Backend](https://github.com/conveyal/analysis-backend)

The Scenario Editor needs an Analysis Backend running to point at. By default it expects it to be running at `http://localhost:7070`.

### Authentication with [Auth0](https://auth0.com/)

Copy the `/configurations/default/env.yml.tmp` to `/configurations/default/env.yml` and add your Auth0 credentials. If you're running locally (for testing or development) you don't need to use Auth0. Just comment out the Auth0 lines and it should work. You'll also need some tile URLs for Leaflet. The default Mapbox URLs require an access key. If you're at Conveyal, you can grab these keys and other settings from our se-configurations repository on Github.

## Install & Run with [Node 6+](https://nodejs.org/en/download/current/)

First make sure you're running the latest Node and NPM. For example, on a Mac using Homebrew:

```bash
$ brew update
$ brew upgrade node
```

Then build and start the scenario editor:
```bash
$ npm install && npm start
```




## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fconveyal%2Fanalysis-ui.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fconveyal%2Fanalysis-ui?ref=badge_large)