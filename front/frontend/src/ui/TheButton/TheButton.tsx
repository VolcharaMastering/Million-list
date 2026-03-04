import "./TheButton.scss";
import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export type TheButtonVariant = "primary" | "secondary" | "danger";
export type TheButtonSize = "normal" | "small";

export type TheButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: TheButtonVariant;
  size?: TheButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  /** Required when only icon is shown (no children). */
  "aria-label"?: string;
};

const sizeClass = (size: TheButtonSize) =>
  size === "small" ? "the-button--small" : "";

const variantClass = (v: TheButtonVariant) => `the-button--${v}`;

export const TheButton = ({
  variant = "primary",
  size = "normal",
  icon: Icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: TheButtonProps) => {
  const isIconOnly = Boolean(Icon && !children);
  const classNames = [
    "the-button",
    variantClass(variant),
    sizeClass(size),
    isIconOnly ? "the-button--icon-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      aria-label={isIconOnly ? rest["aria-label"] : undefined}
      {...rest}
    >
      {Icon && iconPosition === "left" && <Icon className="the-button__icon" aria-hidden />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="the-button__icon" aria-hidden />}
    </button>
  );
};
