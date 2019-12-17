import finalForm from './finalForm'
import { connect } from 'react-redux'
import { compose } from 'redux'
import connectResources, { prefetchResources } from 'ds-resource'
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import { QueryParams } from 'ds-api'

const QS = new QueryParams()
const nonFieldErrorKeys = ['non_field_errors', 'nonFieldErrors', 'detail']

const defaultConfigs = {
  prefetch: true,
}

export default function(form, resource, configs = defaultConfigs) {
  if(isEmpty(form)) {
    throw new Error('form configs are required')
  }
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
  return compose(
    configs.prefetch ? prefetchResources(resource, configs) : typeof resource === 'function' ? resource : connectResources(resource),
    connect((state) => ({
      initialValues: form.initialValues || get(state, `${key}.data`, {}),
    }), (_, props) => {
      if(typeof resource === 'function') {
        return { onSubmit: get(props, `${key}.customRequest`) }
      }
      return {
        onSubmit: (data) => handleSubmit(data, get(props, key), { forceUpdates: true })
          .catch(error => {
            const errors = Object.entries(error || {}).reduce(function(res, [key, value]) {
              let eKey = key
              if(nonFieldErrorKeys.includes(key)) {
                eKey = '_error'
              }
              return {
                ...res,
                [eKey]: Array.isArray(value) ? value[0] : value,
              }
            }, {})
            return errors
          }),
      }
    }),
    finalForm({ ...form }),
  )
}

function handleSubmit(data, resource, meta) {
  return get(data, 'uuid') ? resource.update(data, meta) : resource.create(data, meta)
}
