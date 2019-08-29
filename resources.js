"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearAllData = clearAllData;
exports.persistAction = persistAction;
exports.request = request;
exports.setData = setData;
exports.setFilters = setFilters;
exports.setErrors = setErrors;
exports.setLoading = setLoading;
exports["default"] = connectResouces;
exports.resourcesReducer = resourcesReducer;
exports.epic = epic;
exports.combineReducers = combineReducers;
exports.makeCustomEpic = makeCustomEpic;
exports.CLEAR_ALL = exports.PERSIST = exports.SET_DATA = exports.REQUEST = void 0;

var _redux = require("redux");

var _reactRedux = require("react-redux");

var _fromPromise = require("rxjs/observable/fromPromise");

var _concat = require("rxjs/observable/concat");

var _of = require("rxjs/observable/of");

require("rxjs/add/operator/delay");

require("rxjs/add/operator/switchMap");

require("rxjs/add/operator/mergeMap");

require("rxjs/add/operator/catch");

require("rxjs/add/operator/filter");

require("rxjs/add/operator/takeUntil");

var _pathToRegexp = _interopRequireDefault(require("path-to-regexp"));

var _omit = _interopRequireDefault(require("lodash/omit"));

var _pick = _interopRequireDefault(require("lodash/pick"));

var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));

var _get = _interopRequireDefault(require("lodash/get"));

var _has = _interopRequireDefault(require("lodash/has"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

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
var CLEAR_RESOURCES = '@resource/clear';
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

function request(payload, meta) {
  return {
    type: REQUEST,
    meta: meta,
    payload: payload
  };
}

function setData(payload, meta) {
  return {
    type: SET_DATA,
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
    return {
      namespace: resource,
      key: resource
    };
  }

  return {
    namespace: resource.namespace,
    key: resource.prefix || resource.namespace
  };
}

function mapStateToProps(resources) {
  return function (state, props) {
    if (!Array.isArray(resources)) {
      resources = [resources];
    }

    return resources.reduce(function (res, resource) {
      var _getNameSpaceFromReso = getNameSpaceFromResource(resource),
          key = _getNameSpaceFromReso.key,
          namespace = _getNameSpaceFromReso.namespace;

      return _objectSpread({}, res, _defineProperty({}, key, _objectSpread({}, props[key], {}, (0, _get["default"])(state, namespace, {}))));
    }, {});
  };
}

function getMetaFromResource(resource) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof resource === 'string') {
    return _objectSpread({
      endpoint: resource,
      namespace: resource,
      dataFunction: 'object'
    }, options);
  }

  return _objectSpread({
    dataFunction: 'object'
  }, resource, {}, options, {
    endpoint: resource.endpoint || resource.namespace,
    namespace: resource.namespace
  });
}

function makeRequestAction(type, meta) {
  return function (dispatch) {
    return function (payload) {
      var actionmeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new Promise(function (resolve, reject) {
        dispatch(request(payload, _objectSpread({}, meta, {
          resolve: resolve,
          reject: reject
        }, actionmeta, {
          type: type
        })));
      });
    };
  };
}

function makeSimpleAction(meta, action) {
  return function (dispatch) {
    return function (payload) {
      var actionmeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return dispatch(action(payload, _objectSpread({}, meta, {}, actionmeta)));
    };
  };
}

function makeResourceActions(resource) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var meta = getMetaFromResource(resource, options);
  var actions = {
    create: makeRequestAction('POST', meta),
    fetch: makeRequestAction('GET', meta),
    update: makeRequestAction('PATCH', meta),
    remove: makeRequestAction('DELETE', meta),
    replace: makeRequestAction('PUT', meta),
    fetchOptions: makeRequestAction('OPTIONS', meta),
    setData: makeSimpleAction(meta, setData),
    setErrors: makeSimpleAction(meta, setErrors),
    setLoading: makeSimpleAction(meta, setLoading)
  };

  if ((0, _get["default"])(resource, 'form')) {
    actions.onSubmit = makeRequestAction('submitForm', meta);
  }

  if ((0, _has["default"])(resource, 'queries')) {
    actions.setFilters = makeSimpleAction(meta, setFilters);
  }

  return actions;
}

function bindActions(actions, dispatch) {
  return Object.keys(actions).reduce(function (acts, key) {
    if (!actions[key]) {
      return acts;
    }

    return _objectSpread({}, acts, _defineProperty({}, key, actions[key](dispatch)));
  }, {});
}

function mapDispatchToProps(resources, options) {
  return function (dispatch) {
    if (!Array.isArray(resources)) {
      resources = [resources];
    }

    return resources.reduce(function (res, resource) {
      var _objectSpread4;

      var _getNameSpaceFromReso2 = getNameSpaceFromResource(resource),
          key = _getNameSpaceFromReso2.key;

      var _makeResourceActions = makeResourceActions(resource, options),
          onSubmit = _makeResourceActions.onSubmit,
          actions = _objectWithoutProperties(_makeResourceActions, ["onSubmit"]);

      return _objectSpread({}, res, (_objectSpread4 = {}, _defineProperty(_objectSpread4, key, _objectSpread({}, res[key], {}, bindActions(actions, dispatch))), _defineProperty(_objectSpread4, "onSubmit", res.onSubmit || bindActions({
        onSubmit: onSubmit
      }, dispatch).onSubmit), _objectSpread4));
    }, {});
  };
}

function connectResouces(resource) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return (0, _redux.compose)((0, _reactRedux.connect)(null, function (_, props) {
    return mapDispatchToProps(resource, options, props);
  }), (0, _reactRedux.connect)(mapStateToProps(resource)));
}

function resourcesReducer() {
  var _SET_ERRORS$SET_FILTE;

  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 ? arguments[1] : undefined,
      type = _ref.type,
      _ref$payload = _ref.payload,
      payload = _ref$payload === void 0 ? {} : _ref$payload,
      _ref$meta = _ref.meta,
      meta = _ref$meta === void 0 ? {} : _ref$meta;

  switch (type) {
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

      var _meta$dataFunction = meta.dataFunction,
          dataFunction = _meta$dataFunction === void 0 ? 'object' : _meta$dataFunction;
      return _objectSpread({}, state, {
        data: typeof dataFunction === 'function' ? dataFunction((0, _get["default"])(state, 'data'), payload) : concatDataFunctions[dataFunction]((0, _get["default"])(state, 'data'), payload)
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

    var _ref2 = nextData || {},
        count = _ref2.count,
        results = _ref2.results;

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

function getFormRequestType() {
  var form = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var data = arguments.length > 1 ? arguments[1] : undefined;
  var formAction = form.formAction,
      switchActionByKey = form.switchActionByKey;

  if (!switchActionByKey) {
    return formAction || 'POST';
  }

  return (0, _get["default"])(data, switchActionByKey) ? (0, _get["default"])(formAction, 'update', 'PUT') : (0, _get["default"])(formAction, 'create', 'POST');
}

function epic(action$, store, _ref3) {
  var API = _ref3.API,
      navigate = _ref3.navigate;
  // FIXME API
  return action$.ofType(REQUEST).mergeMap(function (_ref4) {
    var meta = _ref4.meta,
        payload = _ref4.payload;
    console.log({
      navigate: navigate
    });
    var type = meta.type,
        endpoint = meta.endpoint,
        form = meta.form,
        namespace = meta.namespace,
        _meta$queries = meta.queries,
        queries = _meta$queries === void 0 ? [] : _meta$queries,
        isList = meta.isList,
        resolve = meta.resolve,
        forceUpdates = meta.forceUpdates,
        reject = meta.reject,
        _meta$withNavigation = meta.withNavigation,
        withNavigation = _meta$withNavigation === void 0 ? false : _meta$withNavigation;

    if (endpoint.search(/\/:/) > -1) {
      endpoint = _pathToRegexp["default"].compile(endpoint)(payload);
    }

    var isFormAction = type === 'submitForm';

    if (isFormAction) {
      type = getFormRequestType(form, (0, _get["default"])(store.getState(), "".concat(namespace, ".data")));
    }

    return (0, _concat.concat)((0, _of.of)(!forceUpdates && setLoading(true, meta), !forceUpdates && setErrors({}, meta), withNavigation && type === 'GET' && navigate((0, _pick["default"])(payload, queries)), !(0, _isEmpty["default"])(queries) && !forceUpdates && setFilters((0, _pick["default"])(payload, queries), meta)), (0, _fromPromise.fromPromise)(API(endpoint).request(type, (0, _pick["default"])(payload, queries), (0, _omit["default"])(payload, queries))).switchMap(function (response) {
      return (0, _of.of)(isList && type !== 'GET' ? request(undefined, _objectSpread({}, meta, {
        type: 'GET'
      })) : setData(response, meta), !forceUpdates && setLoading(false, meta), resolve(response));
    })["catch"](function (err) {
      return (0, _concat.concat)((0, _of.of)(!forceUpdates && setErrors(err.errors || err, meta), !forceUpdates && setLoading(false, meta), reject(err.errors || err, meta))).filter(Boolean);
    })).filter(Boolean);
  });
}

var PERSIST_WHITE_LIST = JSON.parse((0, _get["default"])(process, 'env.PERSIST_WHITE_LIST') ? process.env.PERSIST_WHITE_LIST : require('react-native-config').PERSIST_WHITE_LIST);

function combineReducers(reducers) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case CLEAR_ALL:
        return (0, _pick["default"])(state, ['router'].concat(_toConsumableArray(PERSIST_WHITE_LIST)));

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

function makeCustomEpic(actionType, customFetch) {
  function epic(action$, store, _ref5) {
    var API = _ref5.API,
        navigate = _ref5.navigate;
    // FIXME API
    return action$.ofType(actionType).mergeMap(function (_ref6) {
      var meta = _ref6.meta,
          payload = _ref6.payload;
      var type = meta.type,
          endpoint = meta.endpoint,
          _meta$queries2 = meta.queries,
          queries = _meta$queries2 === void 0 ? [] : _meta$queries2,
          resolve = meta.resolve,
          forceUpdates = meta.forceUpdates,
          reject = meta.reject,
          _meta$withNavigation2 = meta.withNavigation,
          withNavigation = _meta$withNavigation2 === void 0 ? false : _meta$withNavigation2;

      if (endpoint.search(/\/:/) > -1) {
        endpoint = _pathToRegexp["default"].compile(endpoint)(payload);
      }

      return (0, _concat.concat)((0, _of.of)(!forceUpdates && setLoading(true, meta), !forceUpdates && setErrors({}, meta), withNavigation && navigate((0, _pick["default"])(payload, queries)), !(0, _isEmpty["default"])(queries) && !forceUpdates && setFilters((0, _pick["default"])(payload, queries), meta)), (0, _fromPromise.fromPromise)(customFetch(API, payload, _objectSpread({}, meta, {
        endpoint: endpoint
      }))).switchMap(function (response) {
        return (0, _of.of)(setData(response, meta), !forceUpdates && setLoading(false, meta), resolve(response));
      })["catch"](function (err) {
        console.log({
          err: err
        });
        return (0, _concat.concat)((0, _of.of)(!forceUpdates && setErrors(err.errors || err, meta), !forceUpdates && setLoading(false, meta), reject(err.errors || err, meta))).filter(Boolean);
      })).filter(Boolean);
    });
  }

  function connectResouces() {
    var resource = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!(0, _has["default"])(resource, 'namespace')) {
      throw new Error('connect custom epic should have "namespace"');
    }

    return (0, _redux.compose)((0, _reactRedux.connect)(null, function (dispatch, props) {
      return _defineProperty({}, resource.namespace, {
        fetch: function fetch(payload) {
          var actionmeta = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve, reject) {
            dispatch({
              type: actionType,
              payload: payload,
              meta: _objectSpread({}, resource, {}, actionmeta, {
                resolve: resolve,
                reject: reject
              })
            });
          });
        }
      });
    }), (0, _reactRedux.connect)(function (state, props) {
      return _objectSpread({}, props, _defineProperty({}, resource.namespace, _objectSpread({}, (0, _get["default"])(props, resource.namespace, {}), {}, (0, _get["default"])(state, resource.namespace, {}))));
    }));
  }

  return {
    connect: connectResouces,
    epic: epic
  };
}