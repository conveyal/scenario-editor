import debounce from 'lodash.debounce'
import React, {Component, PropTypes} from 'react'

import {Button, Group as ButtonGroup} from './buttons'
import Icon from './icon'
import {Text} from './input'
import download from '../utils/download-variant'

export default class VariantEditor extends Component {
  static propTypes = {
    createVariant: PropTypes.func.isRequired,
    currentScenario: PropTypes.object.isRequired,
    modifications: PropTypes.array.isRequired,
    saveScenario: PropTypes.func.isRequired,
    scenarioName: PropTypes.string,
    showVariant: PropTypes.func.isRequired,
    updateVariant: PropTypes.func.isRequired,
    analyzeVariant: PropTypes.func.isRequired,
    variants: PropTypes.array.isRequired,
    scenarioId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired
  }

  _export = (variantIndex) => {
    const {feeds, modifications, scenarioName, variants} = this.props
    download({
      description: `${scenarioName}-${variants[variantIndex]}`,
      feeds,
      modifications: modifications.filter((m) => m.variants[variantIndex])
    })
  }

  _create = () => {
    const {currentScenario, saveScenario} = this.props
    // once upon a time a bug could cause variants to be null. allow recovering from this scenario.
    saveScenario({
      ...currentScenario,
      variants: [...(currentScenario.variants || []), 'New variant']
    })
  }

  _debouncedSaveScenario = debounce(this.props.saveScenario, 500)
  _update = ({index, name}) => {
    const {currentScenario, updateVariant} = this.props
    const variants = [...currentScenario.variants]
    variants[index] = name
    updateVariant({index, value: name})
    this._debouncedSaveScenario({
      ...currentScenario,
      variants
    })
  }

  _analyze = (index) => {
    const { projectId, scenarioId, analyzeVariant } = this.props
    analyzeVariant({ projectId, scenarioId, index })
  }

  render () {
    const {showVariant, variants, projectId, scenarioId} = this.props
    return (
      <div className='ModificationGroup'>
        <div className='DockTitle'>
          <Icon type='code-fork' /> Variants
          <a
            className='pull-right'
            onClick={this._create}
            >
            <Icon type='plus' /> Create
          </a>
        </div>
        <form className='Variants form-inline'>
          {variants.map((v, index) =>
            <Variant
              exportVariant={this._export}
              projectId={projectId}
              scenarioId={scenarioId}
              index={index}
              key={`variant-${index}`}
              name={v}
              show={showVariant}
              update={this._update}
              analyze={this._analyze}
              />
            )}
        </form>
      </div>
    )
  }
}

class Variant extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    scenarioId: PropTypes.string.isRequired
  }

  _export = () => {
    const {exportVariant, index} = this.props
    exportVariant(index)
  }

  _update = (e) => {
    const {index, update} = this.props
    update({
      index,
      name: e.target.value
    })
  }

  _show = () => {
    const {index, show} = this.props
    show(index)
  }

  _analyze = () => {
    const {index, analyze} = this.props
    analyze(index)
  }

  render () {
    const {index, name, projectId, scenarioId} = this.props
    return (
      <div className='Variants-Variant'>
        <Text
          label={`${index + 1}. `}
          onChange={this._update}
          value={name}
          />
        <ButtonGroup>
          <Button onClick={this._export} title='Export'><Icon type='download' /></Button>
          <Button href={`/reports/${projectId}/scenarios/${scenarioId}/variants/${index}`} target='_blank' title='Print'><Icon type='print' /></Button>
          <Button onClick={this._analyze} title='Analysis'><Icon type='area-chart' /></Button>
          <Button onClick={this._show} style='info' title='Show on map'><Icon type='eye' /></Button>
        </ButtonGroup>
      </div>
    )
  }
}
