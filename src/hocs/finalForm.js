import { Form } from 'react-final-form'
import { useCallback } from 'react'
import PropTypes from 'prop-types'

export default function withFinalForm({ validate = () => {}, onSubmitSuccess, onSubmitFailed, ...configs }) {
  return function HOC(Component) {
    finalForm.propTypes = {
      onSubmit: PropTypes.func,
      initialValues: PropTypes.object,
    }
    finalForm.defaultProps = {
      onSubmit: undefined,
      initialValues: {},
    }

    function finalForm(props) {
      const handleValidate = useCallback(e => validate(e, props), [props])
      const onSubmit = (values) => (configs.onSubmit || props.onSubmit)(values)
        .then(data => {
          if(typeof onSubmitSuccess === 'function') {
            onSubmitSuccess(data)
          }
        })
        .catch(err => {
          if(typeof onSubmitFailed === 'function') {
            onSubmitFailed(err)
          }
          return err
        })
      return <Form
        onSubmit={onSubmit}
        validate={handleValidate}
        initialValues={configs.initialValues || props.initialValues}
        render={data => <Component {...props} handleSubmit={data.handleSubmit} />}
        {...configs}
      />
    }
    return finalForm
  }
}
