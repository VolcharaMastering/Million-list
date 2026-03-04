import "./TheInput.scss";
import { useId, type InputHTMLAttributes, type ChangeEvent } from "react";

export type TheInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  /** Restrict input to digits only. Value stays string for compatibility. */
  numericOnly?: boolean;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");

export const TheInput = ({
  value,
  onChange,
  label,
  error,
  numericOnly = false,
  id: idProp,
  className = "",
  disabled,
  ...rest
}: TheInputProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(numericOnly ? onlyDigits(next) : next);
  };

  return (
    <div className={`the-input ${error ? "the-input--error" : ""} ${className}`}>
      {label && (
        <label htmlFor={id} className="the-input__label">
          {label}
        </label>
      )}
      <input
        {...rest}
        id={id}
        type="text"
        inputMode={numericOnly ? "numeric" : undefined}
        pattern={numericOnly ? "[0-9]*" : undefined}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="the-input__field"
      />
      {error && (
        <span id={`${id}-error`} className="the-input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
