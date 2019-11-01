## The goal

working with REST-api and redux, using common practice, we always create almost same actions and reducers to send HTTP request to different endpoints. This will lead to problem that our projects will always have lot of duplicated code. For example

```
// action types
const FETCH_USERS_LIST = Symbol('FETCH_USERS_LIST')
const FETCH_USER = Symbol('FETCH_USER')
const SAVE_USER = Symbol('SAVE_USER')
const CREATE_USER = Symbol('CREATE_USER')

// action creators
function fetchUsersList() {
  return {
    type: FETCH_USERS_LIST
  }
}

function fetchUser(id) {
  return {
    type: FETCH_USER,
    payload: id,
  }
}

function saveUser(id, data) {
  return {
    type: SAVE_USER,
    payload: data,
    meta: {id}
  }
}

function createUser(data) {
  return {
    type: CREATE_USER,
    payload: data,
  }
}

// reducers
function users(state = {}, action) {
  switch(action.type) {
    case FETCH_USERS_LIST:
      return {...state, isLoading: true}
    case SAVE_USER:
      return {...state, ...action.payload, isLoading: false}
  }
}

// epics
// TODO
...
```
this example does not contains error handling, caching data, authorization, options, filters ...
And basically we always copy paste this code from file to file and rename function names and constants values

```
fetchUsers
fetchBooks
fetchGroups
fetchComputers
fetchOrders
etc
```

this package will  help u stop to duplicating code and start thinking about more interesting staff in your projects

1. REST API CRUD:
```
endpoint: /api/v1/users/:id

GET /api/v1/users/ - get users list
POST /api/v1/users/ - create new user
GET /api/v1/users/1 - get user details
PATCH /api/v1/users/1 - update user
POST /api/v1/users/1 - recreate user
PUT /api/v1/users/1 - полностью перезаписать юзера (обычно не используем)
DELETE /api/v1/users/1 - delete user
OPTIONS /api/v1/users/ - get metadata
```

2. endpoint CRUD
```
endpoint: /api/v1/some/custom/endpoint
```
And this basically same as previous, but it has only 1 single resource.

resources will give u ability to add all data and methods to communicate with REST API almost with 1 line of code.
```
connectResource([resource])

// where:
resource = {
 namespace: 'internalResourceName',
 endpoint: '/some/endpoint/with/:placeholders',
 forceUpdates: true|false (default false),
 withNavigation: true|false (default false),
 reducer: 'object|paginationList|none|replace|custom function' (default 'object'),
 queries: [],
}
```

And in props u will have next data:
```
props.internalResourceName = {
  data: { /* ... resource data from API ... */ },
  isLoading: true|false, 
  options: { /* parsed OPTIONS from API */ },
  errors: null, // or object with errors { },
  
  // actions
  fetch: func, // GET request, useful when no prefetch
  fetchOptions: func, // OPTIONS request
  create: func, // POST request
  save: func, // PATCH request
  update: func, // PATCH request, alias for save
  remove: func, // DELETE request
  replace: func, // PUT request if you need it
  setData: func, // you can update data in store manually, but please be carefull with this action
  setLoading: func, // you can updates isLoading in store manually, but please be carefull with this action
  setErrors: func, // you can updates errors in store manually, but please be carefull with this action
  setFilters: func, // you can updates current filters in store manually, but please be carefull with this action
  filters: {}, // current applied filters
}
```


## Options

all options could be defined with connectResource (on initialization level) and then u can override all options when  u will call a function


#### `namespace : String` [required]

property name for resource binding. e.g. for `namespace: 'test'` you will get resource in `props.test`. And all data will be saved in store under the "test" key.


#### `endpoint : String` [optional] [default: value of namespace option]

will be set to `namespace` if ommited. resource endpoint name - where to get data from server.
can contains placeholders (see doc for `path-to-regexp` package for additional information). all you current props will be forwarded to `path-to-regexp`, plus one additional property `id` wich will be get by `idKey` (see below)

#### `forceUpdates : Boolean` [optional] [default: false]
By default resources will trigger all circle methods 
 1.  toggle loading, clear errors, safe filters
 2. send HTTP request
 3. toggle loading, set errors(on catch)
 
 In case u want just send HTTP request and then send another one for better performance it is better to set this param to false and call this methods by your own

#### `queries : Object` [optional] [default: {}]

used with list resources. representing initial query for fetch request.

#### `reducer : String|Function` [optional] [default: 'object'}]
one of possible reducer functions that u can use.
Possible variants:
- **object**: Object.assign (prevState, nextState)
- **paginationList**: reducer for lists dataStructures `{count:int,results:[]}`
- **none**:  return prevState
- **replace** return nextState
or u can define your custom function



### Examples

```
class App extends Component {
  componentDidmount() {
    //get users
    this.props.users.fetch()
    //get books
    this.props.books.fetch({offset: 0, limit: 25})
    //get book by id
    this.props.books.fetch({id: 'harry_potter'})
    //but u can to more!
    this.props.books.fetch({id: 'harry_potter'}, {namespace: 'test', endpoint: 'cars'}) //that will send get request to cars endpoint and save data to test in redux
    or 
    this.props.books.setLoading(true); //set loading
    this.props.books.fetch(null, {endpoint: 'users/me', reducer: 'none', forceUpdates: true})
      .then((me)=>this.props.books.fetch({id: me.uuid})) //get book with same uuid as user
    
  }
  render(){...}
}



 connectResource([
  {
    namespace: 'books',
    endpoint: 'books/:id?',
    queries: ['offset', 'limit'],
    reducer: 'paginationList'
  },
  'users' //u can use even just a string in case your enpoint == namespace and all other configs are default
 ])(App)
```

#### connect single resource 
```
connectResource({
  namespace: 'books', 
  endpoint: 'books/:id?'
})
or 
connectResource('users')
```
#### connect multiple resource 
```
connectResource([{
  namespace: 'books', 
  endpoint: 'books/:id?'
}, 'users'])
```

#### customResource
In case u need more complex logic rather then sending 1 HTTP request, but u still want to have all abilities that brings `resources`.
customResource will return HOC which will add same props as connectResource, and add 1 more function `this.props[namespace].customFetch` and this customFetch will work same as .fetch but instead of sending predefined single HTTP request it will run your own async task. So it might be very useful in your projects to have standard resource abilities + your own async job

```
function myCustomFetch(API, payload, meta) {
  return new Promise(function(resolve,reject){
    setTimeout(()=>resolve({succes: true}),1000)
  })
}

const customConnect = customResource(myCustomFetch)
```

then u can use this HOC with your components
```
class Test extends Component {
  componentDidMount(){
    this.props.test.customFetch({},{<owerride configs>})
  }
  ...
}
export default customConnect({namespace: 'test', endpoint: 'test'})(Test)
//or 
export default customConnect('test')(Test)
///but not
customConnect([{...}, 'test'])(Test)
```

customConnect HOC will not support array of resources because it is single resource HOC 


# HOCS
This package will also provide a standard list of React Hight Order Components:
 - prefetchResources
 - withReduxForm
 - withInfinityList
 
## prefetchResources
A Height Order Component that will send Get Request on ComponentDidMount and, in case this request will be still pending,  terminate this request on ComponentWillUnmount. Also prefetch resource will use navigator params and queryparams from routeer by default.
`prefetchResources(resources, options)`
#### `resources : String|Object|function|Array` [required]
- resources could be a String. In this case it will connect resource with `endpoint` and `namespace` that are equal to resources(String)
- resources could be an Object. In this case this thould be configurations object for resources
- resources could be a function. In case this is a function it should be a HOC that returns from `customResource` function. In this case HOC will send custom request on ComponentDidMount instead of using standard fetch
- resources could be an array of whatever previous posibble values
#### `options : Object` 
with options u can specify some configuration such as 
- `parseQueryParams: Function` => function that get String from location.search and transform this to Object. By defaylt uses parseQueryParams from `ds-api`
- `defaultParams: Object` => object with whatever default params that should be passed to initial GET request
- `cleanOnUnmount: Boolean` => whenever u need to clean data on unmount

### usage
```
  // GET /users
  prefetchResources('users') 
  
  // GET /users/me
  prefetchResources({
    namespase: 'user',
    endpoint: 'users/:uuid'
  }, {
      defaultParams: {
        uuid: 'me'
      }
  }) 
  // run MyAsincFunction
  const customConnect = customResource(MyAsincFunction)
  prefetchResources(customConnect('custom'))
  //All together
  prefetchResources([
    'users',
    customConnect('custom'),
    {
      namespase: 'user',
      endpoint: 'users/:uuid'
    },
  ],{
    defaultParams: { uuid: 'me' }
  })
  
  //if you need to get some initial data that depends on someother data from redux-store
  
  compose(
    connect(state=>({
       ord_uuid: state.user.organization  
    })),
    prefetchResources({
        namespace: 'userOrg',
        endpoint: 'organizations/:ord_uuid'
    })
  )
```

### withInfinityList

Hight orderComponent to work with inifinity lists with filter functionality 
`prefetchResources(resources, options)`
#### `resources : String|Object|function` [required]
same as with prefetchResources but resources could not be an array it should be only a single resource
#### `options : Object` 
with options u can specify some configuration such as 
- `parseQueryParams: Function` => function that get String from location.search and transform this to Object. By defaylt uses parseQueryParams from `ds-api`
- `defaultParams: Object` => object with whatever default params that should be passed to initial GET request
- `cleanOnUnmount: Boolean` => whenever u need to clean data on unmount
- `prefetch: Boolean [default true]` => whenever u need to fetch data on mount
### usage
```
    function infinityList ({
        cars,
        loadNext,
        onRefresh,
        isRefreshing,
        onSearch
    }) {
        return (
            <>
                <TextInput onChangeText={(value)=>onSearch({search: value})}/>
                <FlatList
                    data={get(cars, 'data.results', [])}
                    onEndReached={loadNext}
                    onRefresh={onRefresh}
                    refreshing={isRefreshing}
                    renderItem={YourItem}
                    keyExtractor={yourKeyExtractor}
                />
            </>
        )
    }
    
    export default withInfinityList('users')
```

### withReduxForm

that will connect Redux-form and resource with prefetch functionality, adding prefetched data as initialValues and sending POST/PUT request based on if it is new object or updating existing one
`withReduxForm(form, resources, options)`
#### `form : Object` [required] 
redux-form configs
#### `resources : String|Object|function` [required]
same as with prefetchResources but resources could not be an array it should be only a single resource
#### `options : Object` 
with options u can specify some configuration such as 
- `parseQueryParams: Function` => function that get String from location.search and transform this to Object. By defaylt uses parseQueryParams from `ds-api`
- `defaultParams: Object` => object with whatever default params that should be passed to initial GET request
- `cleanOnUnmount: Boolean` => whenever u need to clean data on unmount
- `prefetch: Boolean [default true]` => whenever u need to fetch data on mount
### usage
```
withReduxForm(
    form: {
      form: 'userForm',
    },
    resource: {
      namespace: 'user',
      endpoint: 'users/:uuid', //uuid will be retrived from navigation params
    },
    {
        prefetch: true,
        cleanOnUnmount: true
    }
)
```
