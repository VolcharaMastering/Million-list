import "./TheCheckbox.scss";
import { useId, type InputHTMLAttributes } from "react";

export type TheCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label?: string;
};

export const TheCheckbox = ({
  label,
  id: idProp,
  className = "",
  ...rest
}: TheCheckboxProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <div className={`the-checkbox ${className}`}>
      <input
        {...rest}
        id={id}
        type="checkbox"
        className="the-checkbox__input"
        aria-describedby={label ? undefined : rest["aria-label"]}
      />
      {label && (
        <label htmlFor={id} className="the-checkbox__label">
          {label}
        </label>
      )}
    </div>
  );
};
