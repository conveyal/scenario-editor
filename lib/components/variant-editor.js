// @flow
import Icon from '@conveyal/woonerf/components/icon'
import debounce from 'lodash/debounce'
import React, {Component} from 'react'

import {Button, Group as ButtonGroup} from './buttons'
import {Text} from './input'
import download from '../utils/download-variant'

type Props = {
  feeds: Array<{id: string, checksum: string}>,
  modifications: any[],
  saveScenario: (any) => void,
  showVariant: (number) => void,
  updateVariant: ({index: number, value: string}) => void,
  scenario: {
    id: string,
    projectId: string,
    name: string,
    variants: string[]
  }
}

export default class VariantEditor extends Component<void, Props, void> {
  _export = (variantIndex: number) => {
    const {scenario, feeds, modifications} = this.props
    download({
      description: `${scenario.name}-${scenario.variants[variantIndex]}`,
      feeds,
      modifications: modifications.filter((m) => m.variants[variantIndex])
    })
  }

  _create = () => {
    const {scenario, saveScenario} = this.props
    // once upon a time a bug could cause variants to be null. allow recovering from this scenario.
    saveScenario({
      ...scenario,
      variants: [...(scenario.variants || []), 'New variant']
    })
  }

  _debouncedSaveScenario = debounce(this.props.saveScenario, 500)
  _update = ({index, name}: {index: number, name: string}) => {
    const {scenario, updateVariant} = this.props
    const variants = [...scenario.variants]
    variants[index] = name
    updateVariant({index, value: name})
    this._debouncedSaveScenario({
      ...scenario,
      variants
    })
  }

  render () {
    const {scenario, showVariant} = this.props
    return (
      <div>
        <div className='DockTitle'>Variants
          <a
            className='pull-right'
            onClick={this._create}
            tabIndex={0}
            >
            <Icon type='plus' /> Create
          </a>
        </div>
        <form className='Variants form-inline'>
          {scenario.variants.map((v, index) =>
            <Variant
              exportVariant={this._export}
              projectId={scenario.projectId}
              scenarioId={scenario.id}
              index={index}
              key={`variant-${index}`}
              name={v}
              show={showVariant}
              update={this._update}
              />
            )}
        </form>
      </div>
    )
  }
}

type VariantProps = {
  index: number,
  name: string,
  projectId: string,
  scenarioId: string,

  exportVariant: (number) => void,
  show: (number) => void,
  update: ({index: number, name: string}) => void
}

class Variant extends Component<void, VariantProps, void> {
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
          <Button onClick={this._show} style='info' title='Show on map'><Icon type='eye' /></Button>
        </ButtonGroup>
      </div>
    )
  }
}
