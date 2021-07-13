import {createContext, useContext} from 'react'

export const NavigationIsDisabledContext = createContext({
  isDisabled: false,
  setDisabled: (_: boolean) => {}
})

export default function useDisableNavigation() {
  return useContext(NavigationIsDisabledContext)
}
