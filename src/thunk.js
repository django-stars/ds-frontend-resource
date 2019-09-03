export default function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => (next) => (action) => {
    if(typeof action === 'function') {
      return action(dispatch, getState, { ...extraArgument, API: extraArgument.API({ dispatch, getState }) })
    }
    return next(action)
  }
}
