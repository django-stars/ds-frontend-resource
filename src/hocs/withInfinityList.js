import { Component } from 'react'
import { compose } from 'redux'
import pathToRegexp from 'path-to-regexp'
import connectResources from '../resources'
import get from 'lodash/get'
import pick from 'lodash/pick'
import debounce from 'lodash/debounce'
import { QueryParams } from 'ds-api'

const QS = new QueryParams()

const defaultConfigs = {
  prefetch: true,
  cleanOnUnmount: false,
  parseQueryParams: QS.parseQueryParams,
  defaultParams: {
    limit: 20,
  },
}

export default function withInfinityList(resource, configs = defaultConfigs) {
  if(Array.isArray(resource)) {
    throw new Error('withFormResource HOC could acceps only 1 resource')
  }
  if(typeof resource === 'function' && !resource.namespace) {
    throw new Error('resource should be a HOC that returns from customResource function')
  }
  const key = get(resource, 'namespace', resource)
  if(!key) {
    throw new Error('namespace is fequired')
  }
  if(typeof resource === 'string') {
    resource = {
      namespace: resource,
      endpoint: resource,
      queries: ['offset', 'limit'],
    }
  }
  return compose(
    typeof resource === 'function' ? resource : connectResources(resource),
    withList(key, resource, configs),
  )
}

function withList(key, resource, configs) {
  return function(ChildComponent) {
    return class InfinityList extends Component {
      constructor(props) {
        super(props)
        this.getRequestFunction = this.getRequestFunction.bind(this)
        this.cancellRequest = this.cancellRequest.bind(this)
        this.loadNext = this.loadNext.bind(this)
        this.refresh = this.refresh.bind(this)
        this.getapiDatafromProps = this.getapiDatafromProps.bind(this)
        this.onSearch = debounce(this.handleSearch.bind(this), 300)
      }

      componentDidMount() {
        if(!configs.prefetch) {
          return
        }
        const queryData = get(this.props, 'location.search') ? configs.parseQueryParams(get(this.props, 'location.search')) : {}
        const navigationParams = get(this.props, 'match.params', get(this.props, 'navigation.state.params', {}))
        const defaultParams = get(configs, 'defaultParams', {})
        const request = this.getRequestFunction()
        if(!request) { return }

        this.request = request({
          ...queryData, // params from url
          ...navigationParams, // navigation params
          ...defaultParams, // default static params like mobile=true, limit=20
          ...this.getapiDatafromProps(), // some value from store that could be user from connect e.g. organozationID
          offset: 0,
        }, { reducer: 'replace' })
      }

      getapiDatafromProps() {
        const urlConfigs = (pathToRegexp(resource.endpoint || '').keys || []).map(({ name }) => name) || {}
        return pick(this.props, [...urlConfigs, ...get(resource, 'queries', [])]) || {}
      }


      getRequestFunction() {
        return get(this.props[key], 'customRequest') || get(this.props[key], 'fetch')
      }

      cancellRequest() {
        if(this.request && this.request.cancel && typeof this.request.cancel === 'function') {
          this.request.cancel()
        }
      }

      handleSearch(search = {}) {
        this.cancellRequest()
        const request = this.getRequestFunction()
        if(!request) { return }
        const defaultParams = get(configs, 'defaultParams', {})
        this.request = request({ ...defaultParams, ...this.getapiDatafromProps(), ...search, offset: 0 }, { reducer: 'replace' })
        return this.request
      }

      loadNext() {
        const request = this.getRequestFunction()
        if(!request) { return }
        if(get(this.props[key], 'isLoading')) {
          console.warn('InfinitiList: can not load next page while processing previous request')
          return
        }
        const { limit, offset } = get(this.props[key], 'filters', {})
        if((offset + limit) >= get(this.props[key], 'data.count', 0)) { return }
        this.request = request({ ...get(this.props[key], 'filters', {}), offset: offset + limit }, { reducer: 'paginationList' })
        return this.request
      }

      refresh() {
        this.isRefreshing = true
        return this.handleSearch({})
          .finally(() => { this.isRefreshing = false })
      }

      componentWillUnmount() {
        this.cancellRequest()
        if(!configs.cleanOnUnmount) { return }
        this.props[key].setData({}, { reducer: 'replace' })
      }

      render() {
        return (
          <ChildComponent
            {...this.props}
            onSearch={this.onSearch}
            loadNext={this.loadNext}
            onRefresh={this.refresh}
            isRefreshing={this.isRefreshing && get(this.props[key], 'isLoading')}
          />
        )
      }
    }
  }
}
