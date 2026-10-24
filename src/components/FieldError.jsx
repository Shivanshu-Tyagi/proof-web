// The message under a field. Pairs with aria-describedby="<name>-error" from useFormErrors.
const FieldError = ({ name, errors }) => (errors[name]
  ? <p id={`${name}-error`} role="alert" className="field-error">{errors[name]}</p>
  : null);

export default FieldError;
