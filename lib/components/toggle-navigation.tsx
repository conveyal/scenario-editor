import {useState} from 'react'

import {NavigationIsDisabledContext} from 'lib/hooks/use-disable-navigation'

export default function ToggleNavigation({children}) {
  const [isDisabled, setDisabled] = useState(false)
  return (
    <NavigationIsDisabledContext.Provider value={{isDisabled, setDisabled}}>
      {children}
    </NavigationIsDisabledContext.Provider>
  )
}
