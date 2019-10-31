import connectResouces, {
  resourcesReducer,
  ResourceType,
  customResource,
} from './src/resources'
import persistReducer, { reset } from './src/persist'
import thunkMiddleware from './src/thunk'
import { composeReducers, combineReducers } from './src/redux-helpers'
import cacheMiddleware from './src/cache-middleware'
import {
  prefetchResources,
  withReduxForm,
  withInfinityList,
} from './src/hocs'

export default connectResouces

export {
  reset,
  resourcesReducer,
  thunkMiddleware,
  composeReducers,
  combineReducers,
  cacheMiddleware,
  persistReducer,
  ResourceType,
  customResource,
  prefetchResources,
  withReduxForm,
  withInfinityList,
}
