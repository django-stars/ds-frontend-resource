import { useFormState } from 'react-final-form'


export default function useSpy() {
  const { hasValidationErrors, dirtySinceLastSubmit, submitFailed, ...rest } = useFormState()
  return { ...rest, hasValidationErrors, valid: submitFailed ? dirtySinceLastSubmit && !hasValidationErrors : !hasValidationErrors }
}
