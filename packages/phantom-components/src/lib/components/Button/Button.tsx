import React from "react";

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  disabled?: boolean;
  kind: "primary" | "secondary" | "text";
  mode?: string;
  size?: "sm" | "md" | "lg";
  theme?: string;
}



export const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  kind = "primary",
  mode = "light",
  size = "md",
  theme = "toolkit",
  ...props
}) => {
  return (
    <button
      data-disabled={disabled}
      data-kind={kind}
      data-mode={mode}
      data-size={size}
      data-theme={theme}
      {...props}
    >
      {children}
    </button>
  );
};
