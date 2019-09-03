"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearAllData = clearAllData;
exports.persistAction = persistAction;
exports.setData = setData;
exports.setFilters = setFilters;
exports.setErrors = setErrors;
exports.setLoading = setLoading;
exports["default"] = connectResouces;
exports.resourcesReducer = resourcesReducer;
exports.setPersistWhiteList = setPersistWhiteList;
exports.combineReducers = combineReducers;
exports.customResource = customResource;
exports.CLEAR_ALL = exports.PERSIST = exports.SET_DATA = exports.REQUEST = void 0;

var _redux = require("redux");

var _reactRedux = require("react-redux");

var _pathToRegexp = _interopRequireDefault(require("path-to-regexp"));

var _omit = _interopRequireDefault(require("lodash/omit"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _get = _interopRequireDefault(require("lodash/get"));

var _has = _interopRequireDefault(require("lodash/has"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var REQUEST = '@resource/request';
exports.REQUEST = REQUEST;
var SET_DATA = '@resource/set-data';
exports.SET_DATA = SET_DATA;
var SET_ERRORS = '@resource/set-errors';
var SET_LOADING = '@resource/set-loading';
var SET_FILTERS = '@resource/set-filters';
var SET_RESOURCE_DATA = '@resource/set-resourceData';
var PERSIST = '@@Persist@@';
exports.PERSIST = PERSIST;
var CLEAR_ALL = '@@CLEAR_ALL@@';
exports.CLEAR_ALL = CLEAR_ALL;

function clearAllData(payload) {
  return {
    type: CLEAR_ALL,
    payload: payload
  };
}

function persistAction(payload) {
  return {
    type: PERSIST,
    payload: _objectSpread({}, payload, {
      persisted: true
    })
  };
}

function setData(payload, meta) {
  return {
    type: SET_DATA,
    meta: meta,
    payload: payload
  };
}

function setResourceData(payload, meta) {
  return {
    type: SET_RESOURCE_DATA,
    meta: meta,
    payload: payload
  };
}

function setFilters(payload, meta) {
  return {
    type: SET_FILTERS,
    meta: meta,
    payload: payload
  };
}

function setErrors(payload, meta) {
  return {
    type: SET_ERRORS,
    meta: meta,
    payload: payload
  };
}

function setLoading(payload, meta) {
  return {
    type: SET_LOADING,
    meta: meta,
    payload: payload
  };
}

function getNameSpaceFromResource(resource) {
  if (typeof resource === 'string') {
    return resource;
  }

  return resource.namespace;
}

function mapStateToProps(resources) {
  return function (state, props) {
    if (!Array.isArray(resources)) {
      resources = [resources];
    }

    return resources.reduce(function (res, resource) {
      var key = getNameSpaceFromResource(resource);
      return _objectSpread({}, res, _defineProperty({}, key, _objectSpread({}, props[key], {}, (0, _get["default"])(state, key, {}))));
    }, {});
  };
}

function getMetaFromResource(resource) {
  if (typeof resource === 'string') {
    return {
      endpoint: resource,
      namespace: resource,
      dataFunction: 'object'
    };
  }

  return _objectSpread({
    dataFunction: 'object'
  }, resource, {
    endpoint: resource.endpoint || resource.namespace,
    namespace: resource.namespace
  });
}

function defaultHTTPRequest(API, payload, meta) {
  return API(meta.endpoint).request(meta.type, (0, _pick["default"])(payload, meta.queries), (0, _omit["default"])(payload, meta.queries));
}

function makeRequest(httpRequest) {
  return function request(payload, meta) {
    return function (dispatch, getState, _ref) {
      var API = _ref.API,
          navigate = _ref.navigate;
      var type = meta.type,
          endpoint = meta.endpoint,
          _meta$queries = meta.queries,
          queries = _meta$queries === void 0 ? [] : _meta$queries,
          forceUpdates = meta.forceUpdates,
          _meta$withNavigation = meta.withNavigation,
          withNavigation = _meta$withNavigation === void 0 ? false : _meta$withNavigation;

      if (endpoint.search(/\/:/) > -1) {
        endpoint = _pathToRegexp["default"].compile(endpoint)(payload);
      }

      if (!forceUpdates) {
        dispatch(setResourceData({
          isLoading: true,
          errors: {},
          filters: (0, _pick["default"])(payload, queries || [])
        }, meta));
      }

      if (withNavigation && type === 'GET') {
        navigate({
          dispatch: dispatch,
          getState: getState
        }, payload, meta);
      }

      return httpRequest(API, payload, _objectSpread({}, meta, {
        endpoint: endpoint
      })).then(function (response) {
        var _setResourceData;

        dispatch(setResourceData((_setResourceData = {}, _defineProperty(_setResourceData, type === 'OPTIONS' ? 'options' : 'data', response), _defineProperty(_setResourceData, "isLoading", false), _setResourceData), meta));
        return response;
      })["catch"](function (err) {
        if (!forceUpdates) {
          dispatch(setResourceData({
            isLoading: false,
            errors: (0, _get["default"])(err, 'errors', err)
          }, meta));
        }

        throw err;
      });
    };
  };
}

var defaultFetch = makeRequest(defaultHTTPRequest);

function makeRequestAction(type, meta, dispatch) {
  return function (payload, actionmeta) {
    return dispatch(defaultFetch(payload, _objectSpread({}, meta, {}, actionmeta, {
      type: type
    })));
  };
}

function makeSimpleAction(meta, action, dispatch) {
  return function (payload) {
    var actionmeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return dispatch(action(payload, _objectSpread({}, meta, {}, actionmeta)));
  };
}

function makeResourceActions(resource, dispatch) {
  var meta = getMetaFromResource(resource);
  var actions = {
    create: makeRequestAction('POST', meta, dispatch),
    fetch: makeRequestAction('GET', meta, dispatch),
    update: makeRequestAction('PATCH', meta, dispatch),
    remove: makeRequestAction('DELETE', meta, dispatch),
    replace: makeRequestAction('PUT', meta, dispatch),
    fetchOptions: makeRequestAction('OPTIONS', meta, dispatch),
    setData: makeSimpleAction(meta, setData, dispatch),
    setErrors: makeSimpleAction(meta, setErrors, dispatch),
    setLoading: makeSimpleAction(meta, setLoading, dispatch)
  };

  if ((0, _has["default"])(resource, 'queries')) {
    actions.setFilters = makeSimpleAction(meta, setFilters, dispatch);
  }

  return actions;
}

function mapDispatchToProps(resources, dispatch) {
  if (!Array.isArray(resources)) {
    resources = [resources];
  }

  return resources.reduce(function (res, resource) {
    return _objectSpread({}, res, _defineProperty({}, getNameSpaceFromResource(resource), makeResourceActions(resource, dispatch)));
  }, {});
}

function connectResouces(resource) {
  return (0, _redux.compose)((0, _reactRedux.connect)(null, function (dispatch) {
    return mapDispatchToProps(resource, dispatch);
  }), (0, _reactRedux.connect)(mapStateToProps(resource)));
}

function makeData(dataFunction, state, payload) {
  if (typeof dataFunction === 'function') {
    return dataFunction((0, _get["default"])(state, 'data'), payload);
  }

  return concatDataFunctions[dataFunction]((0, _get["default"])(state, 'data'), payload);
}

function resourcesReducer() {
  var _SET_ERRORS$SET_FILTE;

  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref2 = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref2.type,
      _ref2$payload = _ref2.payload,
      payload = _ref2$payload === void 0 ? {} : _ref2$payload,
      _ref2$meta = _ref2.meta,
      meta = _ref2$meta === void 0 ? {} : _ref2$meta;

  switch (type) {
    case SET_RESOURCE_DATA:
      var data = payload.data,
          errors = payload.errors,
          isLoading = payload.isLoading,
          filters = payload.filters,
          options = payload.options;
      return _objectSpread({}, state, {
        errors: errors || state.errors,
        isLoading: isLoading === undefined ? state.isLoading : isLoading,
        filters: filters || state.filters,
        options: options || state.options,
        data: data ? makeData((0, _get["default"])(meta, 'dataFunction', 'object'), state, data) : state.data
      });

    case SET_ERRORS:
    case SET_FILTERS:
    case SET_LOADING:
      var dataKey = (_SET_ERRORS$SET_FILTE = {}, _defineProperty(_SET_ERRORS$SET_FILTE, SET_ERRORS, 'errors'), _defineProperty(_SET_ERRORS$SET_FILTE, SET_FILTERS, 'filters'), _defineProperty(_SET_ERRORS$SET_FILTE, SET_LOADING, 'isLoading'), _SET_ERRORS$SET_FILTE)[type];
      return _objectSpread({}, state, _defineProperty({}, dataKey, payload));

    case SET_DATA:
      if (meta.type === 'OPTIONS') {
        return _objectSpread({}, state, {
          options: (0, _get["default"])(state, 'options')
        });
      }

      return _objectSpread({}, state, {
        data: makeData((0, _get["default"])(meta, 'dataFunction', 'object'), state, payload)
      });

    default:
      return state;
  }
}

var concatDataFunctions = {
  object: function object() {
    var prev = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var next = arguments.length > 1 ? arguments[1] : undefined;
    return _objectSpread({}, prev || {}, {}, next || {});
  },
  paginationList: function paginationList() {
    var prev = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var nextData = arguments.length > 1 ? arguments[1] : undefined;

    if (!(0, _has["default"])(nextData, 'results')) {
      return _objectSpread({}, prev, {
        results: (0, _get["default"])(prev, 'results', []).map(function (item) {
          return item.uuid === nextData.uuid ? _objectSpread({}, item, {}, nextData) : item;
        })
      });
    }

    var _ref3 = nextData || {},
        count = _ref3.count,
        results = _ref3.results;

    return {
      count: count,
      results: [].concat(_toConsumableArray((0, _get["default"])(prev, 'results', [])), _toConsumableArray(results))
    };
  },
  none: function none(prev) {
    return prev;
  },
  replace: function replace(_, next) {
    return next;
  }
};
var PERSIST_WHITE_LIST = [];

function setPersistWhiteList(whitelist) {
  PERSIST_WHITE_LIST = whitelist;
}

function combineReducers(reducers) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case PERSIST:
        return _objectSpread({}, state, {}, action.payload);

      case CLEAR_ALL:
        return (0, _pick["default"])(state, PERSIST_WHITE_LIST);

      default:
        if (action.type.startsWith('@resource/')) {
          return _objectSpread({}, state, _defineProperty({}, action.meta.namespace, resourcesReducer((0, _get["default"])(state, action.meta.namespace, {}), action)));
        }

        return Object.keys(reducers).reduce(function (store, key) {
          return _objectSpread({}, store || {}, _defineProperty({}, key, reducers[key]((0, _get["default"])(state, key), action)));
        }, state);
    }
  };
}

function customResource(_customFetch) {
  return function (resource) {
    if (Array.isArray(resource)) {
      throw new Error('custom resource config can not be an array');
    }

    if (typeof resource === 'string') {
      resource = {
        endpoint: resource,
        namespace: resource,
        dataFunction: 'object'
      };
    }

    var _resource = resource,
        namespace = _resource.namespace;
    return (0, _redux.compose)((0, _reactRedux.connect)(null, function (dispatch) {
      return _defineProperty({}, namespace, _objectSpread({}, mapDispatchToProps(resource, dispatch)[namespace], {
        customFetch: function customFetch(payload, actionmeta) {
          return dispatch(makeRequest(_customFetch)(payload, _objectSpread({}, resource, {}, actionmeta)));
        }
      }));
    }), (0, _reactRedux.connect)(mapStateToProps(resource)));
  };
}