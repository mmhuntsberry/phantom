import React from "react";
import styles from "./button.module.css";

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className, ...rest } = props;
  const mergedClassName = [styles.root, className].filter(Boolean).join(" ");

  return (
    <button {...rest} className={mergedClassName}>
      {props.children}
    </button>
  );
}
