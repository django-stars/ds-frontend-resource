import { compose } from 'redux'
import pathToRegexp from 'path-to-regexp'
import { Component } from 'react'
import connectResources from '../resources'
import get from 'lodash/get'
import pick from 'lodash/pick'
import { QueryParams } from 'ds-api'

const QS = new QueryParams()

const defaultConfigs = {
  cleanOnUnmount: false,
  parseQueryParams: QS.parseQueryParams,
  defaultParams: {},
}

export default function prefetchResources(resources, configs = defaultConfigs) {
  const _resources = Array.isArray(resources) ? resources : [resources]
  const resourcesList = _resources.filter(item => typeof item !== 'function')
  const customResources = _resources.filter(item => typeof item === 'function')
  return compose(
    ...customResources,
    connectResources(resourcesList),
    prefetch(_resources, configs)
  )
}


export function prefetch(resources, configs) {
  return function(ChildComponent) {
    return class Prefetch extends Component {
      constructor(props) {
        super(props)
        this.getResources = this.getResources.bind(this)
      }

      getResources() {
        return resources.map(resource => {
          if(typeof resource === 'string') {
            return { resource: this.props[resource], config: { endpoint: resource } }
          }
          if(typeof resource === 'function') {
            if(typeof get(this.props, `[${resource.namespace}].customRequest`) !== 'function') { return }
          }
          return { resource: this.props[resource.namespace], config: resource }
        }).filter(Boolean)
      }

      componentDidMount() {
        const queryData = get(this.props, 'location.search') ? configs.parseQueryParams(get(this.props, 'location.search')) : {}
        const navigationParams = get(this.props, 'match.params', get(this.props, 'navigation.state.params', {}))
        this.fetchList = this.getResources().map(({ resource, config }) => {
          const urlConfigs = pathToRegexp(config.endpoint || '').keys.map(({ name }) => name) || {}
          const apiDatafromProps = pick(this.props, [...urlConfigs, ...get(config, 'queries', [])])
          const request = resource.customRequest || resource.fetch
          return request({
            ...queryData,
            ...navigationParams,
            ...apiDatafromProps,
            ...get(configs, 'defaultParams', {}),
          })
        })
      }

      componentWillUnmount() {
        if(Array.isArray(this.fetchList)) {
          this.fetchList.forEach(item => {
            if(item && item.cancel && typeof item.cancel === 'function') {
              item.cancel()
            }
          })
        }
      }

      render() {
        return (<ChildComponent {...this.props}/>)
      }
    }
  }
}
