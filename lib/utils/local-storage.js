// @flow
// For testing and old browsers
const localStorage = window && window.localStorage
  ? window.localStorage
  : {
    getItem () { return '' },
    setItem () {},
    removeItem () {}
  }
export default localStorage
