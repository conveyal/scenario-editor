import {createContext} from 'react'

type ControlledFormProps = {
  errors: Set<string>
  isInvalid: boolean
}

const ControlledForm = createContext<ControlledFormProps>({
  errors: new Set(),
  get isInvalid() {
    return this.errors > 0
  }
})

export default ControlledForm
