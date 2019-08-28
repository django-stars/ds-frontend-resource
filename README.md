
### DRAFT --  DRAFT --  DRAFT --  DRAFT --  DRAFT

## The goal

Когда мы работаем с REST-ресурсами, в 90% случаев, все что нам нужно это получить данные и отрендерить или забиндать в форму и сохранить после изменения.
Эта, довольно нетривиальная задача приводит к большому количеству однотипного кода. Что-то вроде:

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
// TODO
function users(state = {}, action) {
  switch(action.type) {
    case FETCH_USERS_LIST:
      return {...state, isLoading: true}
  }
}

// epics
// TODO
...
```

И этот пример не содержит обработку ошибок, фильтрацию, педжинцию, кеширование, JWT, options  и т.п.
При этом подобный код повторяется снова и снова в каждом store файле и по сути отличается лишь наименованием функций и констант:

```
fetchUsers
fetchBooks
fetchGroups
fetchComputers
fetchOrders
etc
```

Задача данного пакета ускорить написание этой рутины, оставив время "на подумать"

В данном пакете подразумевается что каждый API endpoint представляет собой REST ресурс.
Для начала разберемся с самими ресурсами. Здесь они разделяются на два типа:

1. Полноценный CRUD:
```
endpoint: /api/v1/users/:id

GET /api/v1/users/ - получить список юзеров
POST /api/v1/users/ - создать юзера
GET /api/v1/users/1 - получить юзера
PATCH /api/v1/users/1 - частично обновить юзера
POST /api/v1/users/1 - полностью обновить юзера (лучше использовать PATCH)
PUT /api/v1/users/1 - полностью перезаписать юзера (обычно не используем)
DELETE /api/v1/users/1 - удалить юзера
OPTIONS /api/v1/users/ - получить метаданные (обычно choices)
```

2. endpoint CRUD
```
endpoint: /api/v1/some/custom/endpoint
```
отличается от предыдущего тем что это single ресурс, и все запросы формируются на один и тот же endpoint.
при этом этом ресурс может быть предварительно создан на сервере, (тогда GET получает его первоначальное состояние) или же создается отдельно при помощи POST запроса.

resource.js предоставляет вам возможность приконектить такие ресурсы без особой сложности. практически одной строчкой кода:
```
connectResource([resource])

// где:
resource = {
 namespace: 'internalResourceName',
 endpoint: '/some/endpoint/with/:placeholders',
 forceUpdates: true|false (default false),
 withNavigation: true|false (default false),
 dataFunction: 'object|paginationList|none|replace|custom function' (default 'object'),
 queries: [],
 isList: true|false (default false),
}
```

в props получим такую структуру:
```
props.internalResourceName = {
  data: { /* ... resource data from API ... */ },
  isLoading: false, // or true,
  options: { /* parsed OPTIONS from API */ },
  errors: null, // or object with errors { },
  loading: true|false, // number of currently loadings, used internaly
  
  // actions
  fetch: func, // GET request, useful when no prefetch
  fetchOptions: func, // OPTIONS request
  create: func, // POST request
  save: func, // PATCH request
  update: func, // PATCH request, alias for save
  remove: func, // DELETE request
  replace: func, // PUT request if you need it
  setData: func, // you can update data in store manually, but please be carefull with this action
  setErrors: func, // you can updates errors in store manually, but please be carefull with this action
  setFilters: func, // you can updates current filters in store manually, but please be carefull with this action
  filters: {}, // current applied filters
}
```


## Options

почти все опции можно задавать как на уровне конфигурации ресурса, так и на уровне коннекта


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

#### `withNavigation : Boolean` [optional] [default: false]
In case u want to store your query params from API call in browser url u can set this param to true and then when u will GET `/users?offset=0&limit=20 ` this will automatically update browser url

#### `isList : Boolean` [optional] [default: false]

mark you resource as list resource. you endpoint should conins `:id?` placeholder, e.g. `accounts/:id?`
when you have id property (this props name can be changed via `idKey`) in props then the item resource will be binded. otherwice list. 

#### `queries : Object` [optional] [default: {}]

used with list resources. representing initial query for fetch request.

#### `dataFunction : String|Function` [optional] [default: 'object'}]
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
    this.props.books.fetch(null, {endpoint: 'users/me', dataFunction: 'none', forceUpdates: true})
      .then((me)=>this.props.books.fetch({id: me.uuid})) //get book with same uuid as user
    
  }
  render(){...}
}



 connectResource([
  {
    namespace: 'books',
    endpoint: 'books/:id?',
    queries: ['offset', 'limit'],
    dataFunction: 'paginationList'
  },
  'users' //u can use even just a string in case your enpoint == namespace and all other configs are default
 ])(App)
```
