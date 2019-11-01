import connectResouces, {
  resourcesReducer,
  ResourceType,
  customResource,
} from './src/resources'
import {
  prefetchResources,
  withReduxForm,
  withInfinityList,
} from './src/hocs'

export default connectResouces

export {
  resourcesReducer,
  ResourceType,
  customResource,
  prefetchResources,
  withReduxForm,
  withInfinityList,
}
