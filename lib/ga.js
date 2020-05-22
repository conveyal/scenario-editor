import ReactGA from 'react-ga'

ReactGA.initialize(process.env.GA_TRACKING_ID)

export default function ga(...args) {
  ReactGA.ga(...args)
}
