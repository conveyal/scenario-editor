// @flow
import Icon from '@conveyal/woonerf/components/icon'
import message from '@conveyal/woonerf/message'
import React, {Component} from 'react'
import {Link} from 'react-router'

import {ButtonLink} from './buttons'
import {Group} from './input'

type Props = {
  clearCurrentRegion: () => void,
  loadAllRegions: () => void,
  regions: Array<{
    _id: string,
    name: string,
    statusCode: string
  }>
}

export default class SelectRegion extends Component {
  props: Props

  componentDidMount () {
    this.props.clearCurrentRegion()
    this.props.loadAllRegions()
  }

  render () {
    const {regions} = this.props
    return (
      <div className='Welcome'>
        <div className='WelcomeTitle'>
          <span className='logo' to='/'>
            conveyal analysis
          </span>
        </div>
        <Group>
          <ButtonLink
            block
            style='success'
            to='/regions/create'
          >
            <Icon type='plus' /> {message('region.createAction')}
          </ButtonLink>
        </Group>
        {regions.length > 0 &&
          <div>
            <p style={{textAlign: 'center'}}>
              {message('region.goToExisting')}
            </p>
            <div className='list-group'>
              {regions.map(region => (
                <Link
                  className='list-group-item'
                  key={region._id}
                  to={`/regions/${region._id}`}
                  title={message('region.goToRegion')}
                >
                  {region.statusCode === 'DONE'
                    ? <span><Icon type='map-o' /> {region.name}</span>
                    : <div>
                      <p>
                        <Icon type='spinner' className='fa-spin' />
                        {' '}
                        {region.name}
                      </p>
                      <em>
                        {message(`region.statusCode.${region.statusCode}`)}
                      </em>
                    </div>}
                </Link>
              ))}
            </div>
          </div>}
        <p className='center'>
          <a href='/logout'><Icon type='sign-out' /> {message('authentication.logOut')}</a>
        </p>
      </div>
    )
  }
}
