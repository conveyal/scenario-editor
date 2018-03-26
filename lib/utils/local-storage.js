// @flow
// For testing and old browsers
const localStorage = window && window.localStorage
  ? window.localStorage
  : {
    getItem () {},
    setItem () {}
  }
export default localStorage
