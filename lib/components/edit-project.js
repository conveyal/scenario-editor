import React, {PropTypes} from 'react'

import {Button} from './buttons'
import DeepEqualComponent from './deep-equal'
import Icon from './icon'
import {Body, Heading, Panel} from './panel'
import {Text} from './input'
import messages from '../utils/messages'
import R5Version from './r5-version'

const cardinalDirections = ['North', 'South', 'East', 'West']

export default class EditProject extends DeepEqualComponent {
  static propTypes = {
    addComponentToMap: PropTypes.func.isRequired,
    bounds: PropTypes.shape({
      north: PropTypes.number,
      east: PropTypes.number,
      south: PropTypes.number,
      west: PropTypes.number
    }),
    description: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    r5Version: PropTypes.string,
    removeComponentFromMap: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
    setLocally: PropTypes.func.isRequired,
    setCenter: PropTypes.func.isRequired
  }

  componentDidMount () {
    if (this.props.bounds) {
      this.props.addComponentToMap()
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.bounds) {
      this.props.addComponentToMap()
    }
  }

  componentWillUnmount () {
    this.props.removeComponentFromMap()
    // if changes weren't saved, fetch them back from the server
    this.props.load(this.props.id)
  }

  onChangeDescription = (e) => this.onChange({ description: e.target.value })
  onChangeName = (e) => this.onChange({ name: e.target.value })
  onChangeR5Version = (item) => this.onChange({ r5Version: item.value })

  onChange (updatedFields) {
    let { bounds, description, id, name, r5Version, setLocally } = this.props
    // set it locally so that state is shared with bounds editor
    setLocally({
      bounds,
      description,
      id,
      name,
      r5Version,
      ...updatedFields
    })
  }

  _save = (e) => {
    let { bounds, description, id, name, r5Version, save } = this.props
    save({
      bounds,
      description,
      id,
      name,
      r5Version
    })
  }

  _delete = () => {
    if (window.confirm(messages.project.deleteConfirmation)) {
      this.props.deleteProject()
    }
  }

  render () {
    const {bounds, description, name, r5Version} = this.props
    return (
      <Panel>
        <Heading>{messages.project.editTitle}</Heading>
        <Body>
          <Text
            label='Name'
            onChange={this.onChangeName}
            value={name}
            />
          <Text
            label='Description'
            onChange={this.onChangeDescription}
            value={description}
            />
          <R5Version
            label={messages.project.r5Version}
            onChange={this.onChangeR5Version}
            value={r5Version}
            />
          <legend>
            OSM Bounds
          </legend>
          {cardinalDirections.map((direction) =>
            <Text
              key={`bound-${direction}`}
              label={`${direction} bound`}
              disabled
              value={bounds[direction.toLowerCase()]}
              />)}
          <Button
            block
            onClick={this._save}
            style='success'
            >{messages.project.editAction}
          </Button>
          <Button
            block
            onClick={this._delete}
            style='danger'
            ><Icon type='trash' /> {messages.project.deleteAction}
          </Button>
        </Body>
      </Panel>
    )
  }
}
