import React, {PropTypes} from 'react'
import Select from 'react-select'

import {Button} from './buttons'
import DeepEqualComponent from './deep-equal'
import {Body, Heading, Panel} from './panel'

export default class ImportModifications extends DeepEqualComponent {
  static propTypes = {
    copyFromScenario: PropTypes.func.isRequired,
    toScenarioId: PropTypes.string.isRequired,
    variants: PropTypes.array.isRequired
  }

  state = {}

  _copyModificationsFromScenario = () => {
    const {copyFromScenario, toScenarioId, variants} = this.props
    copyFromScenario({
      fromScenarioId: this.state.importScenarioId,
      toScenarioId,
      variants
    })
  }

  _setImportScenarioId = (e) => {
    this.setState({importScenarioId: e.value})
  }

  render () {
    const {candidateScenarioOptions} = this.props
    const {importScenarioId} = this.state
    return (
      <Panel>
        <Heading>Import modifications from another scenario</Heading>
        <Body>
          <div className='form-group'>
            <Select
              onChange={this._setImportScenarioId}
              options={candidateScenarioOptions}
              placeholder='Select a scenario...'
              value={importScenarioId}
              />
          </div>
          <Button
            block
            disabled={!importScenarioId}
            onClick={this._copyModificationsFromScenario}
            style='success'
            >Import modifications
          </Button>
        </Body>
      </Panel>
    )
  }
}
