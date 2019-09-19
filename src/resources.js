import { compose } from 'redux'
import { connect } from 'react-redux'

import pathToRegexp from 'path-to-regexp'

import omit from 'lodash/omit'
import pick from 'lodash/pick'
import get from 'lodash/get'
import has from 'lodash/has'

export const REQUEST = '@resource/request'
export const SET_DATA = '@resource/set-data'
const SET_ERRORS = '@resource/set-errors'
const SET_LOADING = '@resource/set-loading'
const SET_FILTERS = '@resource/set-filters'
const SET_RESOURCE_DATA = '@resource/set-resourceData'


export function setData(payload, meta) {
  return {
    type: SET_DATA,
    meta,
    payload,
  }
}

function setResourceData(payload, meta) {
  return {
    type: SET_RESOURCE_DATA,
    meta,
    payload,
  }
}

export function setFilters(payload, meta) {
  return {
    type: SET_FILTERS,
    meta,
    payload,
  }
}

export function setErrors(payload, meta) {
  return {
    type: SET_ERRORS,
    meta,
    payload,
  }
}

export function setLoading(payload, meta) {
  return {
    type: SET_LOADING,
    meta,
    payload,
  }
}

function getNameSpaceFromResource(resource) {
  if(typeof resource === 'string') { return resource }
  return resource.namespace
}


function mapStateToProps(resources) {
  return function(state, props) {
    if(!Array.isArray(resources)) {
      resources = [resources]
    }
    return resources.reduce((res, resource) => {
      const key = getNameSpaceFromResource(resource)
      return {
        ...res,
        [key]: { ...props[key], ...get(state, key, {}) },
      }
    }, {})
  }
}

function getMetaFromResource(resource) {
  if(typeof resource === 'string') {
    return {
      endpoint: resource, namespace: resource, reducer: 'object',
    }
  }
  return {
    reducer: 'object',
    ...resource,
    endpoint: resource.endpoint || resource.namespace,
    namespace: resource.namespace,
  }
}

function defaultHTTPRequest(API, payload, meta) {
  return API(meta.endpoint, meta.signal).request(meta.type, pick(payload, meta.queries), omit(payload, meta.queries))
}

function makeRequest(httpRequest) {
  return function request(payload, meta) {
    return (dispatch, getState, { API }) => {
      let {
        type,
        endpoint,
        queries = [],
        forceUpdates,
      } = meta
      if(endpoint.search(/\/:/) > -1) {
        endpoint = pathToRegexp.compile(endpoint)(payload)
      }
      if(!forceUpdates) {
        dispatch(setResourceData({
          isLoading: true,
          errors: {},
          filters: pick(payload, queries || []),
        }, meta))
      }
      const controller = new AbortController()
      var wrappedPromise = httpRequest(API, payload, { ...meta, endpoint, signal: controller.signal })
        .then(response => {
          dispatch(setResourceData({
            [type === 'OPTIONS' ? 'options' : 'data']: response,
            isLoading: false,
          }, meta))
          return response
        })
        .catch(err => {
          if(!forceUpdates) {
            dispatch(setResourceData({ isLoading: false, errors: get(err, 'errors', err) }, meta))
          }
          throw err
        })
      wrappedPromise.cancel = function() { controller.abort() }
      return wrappedPromise
    }
  }
}

const defaultFetch = makeRequest(defaultHTTPRequest)

function makeRequestAction(type, meta, dispatch) {
  return function(payload, actionmeta) {
    return dispatch(defaultFetch(payload, { ...meta, ...actionmeta, type }))
  }
}

function makeSimpleAction(meta, action, dispatch) {
  return (payload, actionmeta = {}) => dispatch(action(payload, { ...meta, ...actionmeta }))
}

function makeResourceActions(resource, dispatch) {
  const meta = getMetaFromResource(resource)
  const actions = {
    create: makeRequestAction('POST', meta, dispatch),
    fetch: makeRequestAction('GET', meta, dispatch),
    update: makeRequestAction('PATCH', meta, dispatch),
    remove: makeRequestAction('DELETE', meta, dispatch),
    replace: makeRequestAction('PUT', meta, dispatch),
    fetchOptions: makeRequestAction('OPTIONS', meta, dispatch),
    setData: makeSimpleAction(meta, setData, dispatch),
    setErrors: makeSimpleAction(meta, setErrors, dispatch),
    setLoading: makeSimpleAction(meta, setLoading, dispatch),
  }
  if(has(resource, 'queries')) {
    actions.setFilters = makeSimpleAction(meta, setFilters, dispatch)
  }
  return actions
}

function mapDispatchToProps(resources, dispatch) {
  if(!Array.isArray(resources)) {
    resources = [resources]
  }
  return resources.reduce((res, resource) => ({
    ...res,
    [getNameSpaceFromResource(resource)]: makeResourceActions(resource, dispatch),
  }), {})
}

export default function connectResouces(resource) {
  return compose(
    connect(null, dispatch => mapDispatchToProps(resource, dispatch)),
    connect(mapStateToProps(resource)),
  )
}

function makeData(reducer, state, payload) {
  if(typeof reducer === 'function') {
    return reducer(get(state, 'data'), payload)
  }
  return defaultReducers[reducer](get(state, 'data'), payload)
}


export function resourcesReducer(state = {}, { type, payload = {}, meta = {} }) {
  switch (type) {
    case SET_RESOURCE_DATA:
      const {
        data, errors, isLoading, filters, options,
      } = payload
      return {
        ...state,
        errors: errors || state.errors,
        isLoading: isLoading === undefined ? state.isLoading : isLoading,
        filters: filters || state.filters,
        options: options || state.options,
        data: data ? makeData(get(meta, 'reducer', 'object'), state, data) : state.data,
      }
    case SET_ERRORS:
    case SET_FILTERS:
    case SET_LOADING:
      const dataKey = {
        [SET_ERRORS]: 'errors',
        [SET_FILTERS]: 'filters',
        [SET_LOADING]: 'isLoading',
      }[type]
      return { ...state, [dataKey]: payload }
    case SET_DATA:
      if(meta.type === 'OPTIONS') {
        return ({
          ...state,
          options: get(state, 'options'),
        })
      }
      return ({
        ...state,
        data: makeData(get(meta, 'reducer', 'object'), state, payload),
      })
    default:
      return state
  }
}

const defaultReducers = {
  object: (prev = {}, next) => ({
    ...(prev || {}),
    ...(next || {}),
  }),
  paginationList: (prev = {}, nextData) => {
    if(!has(nextData, 'results')) {
      return {
        ...prev,
        results: get(prev, 'results', []).map(item => (item.uuid === nextData.uuid ? { ...item, ...nextData } : item)),
      }
    }
    const { count, results } = nextData || {}
    return {
      count,
      results: [...get(prev, 'results', []), ...results],
    }
  },
  none: prev => prev,
  replace: (_, next) => next,
}


export function resources(state = {}, action) {
  if(action.type.startsWith('@resource/')) {
    return {
      ...state,
      [action.meta.namespace]: resourcesReducer(get(state, action.meta.namespace, {}), action),
    }
  }
  return state
}


export function customResource(customFetch) {
  return function(resource) {
    if(Array.isArray(resource)) {
      throw new Error('custom resource config can not be an array')
    }
    if(typeof resource === 'string') {
      resource = {
        endpoint: resource,
        namespace: resource,
        reducer: 'object',
      }
    }
    const { namespace } = resource
    return compose(
      connect(null, dispatch => ({
        [namespace]: {
          ...mapDispatchToProps(resource, dispatch)[namespace],
          customFetch: function(payload, actionmeta) {
            return dispatch(makeRequest(customFetch)(payload, { ...resource, ...actionmeta }))
          },
        },
      })),
      connect(mapStateToProps(resource)),
    )
  }
}
