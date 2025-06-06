import React from "react";
import styles from "./button.module.css";

export default function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button {...props} className={styles.root}>
      {props.children}
    </button>
  );
}
