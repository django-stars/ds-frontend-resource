import ResourceType from './ResourceType'
import useResources from './useResources'

import connectResources, {
  resourcesReducer,
  customResource,
} from './src/resources'

export * from './src/hocs'


export {
  connectResources,
  useResources,
  resourcesReducer,
  ResourceType,
  customResource,
}
