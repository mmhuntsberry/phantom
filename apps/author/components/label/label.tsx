import React from "react";
import styles from "./label.module.css";

export default function Label(
  props: React.LabelHTMLAttributes<HTMLLabelElement>
) {
  return (
    <label {...props} className={styles.root}>
      {props.children}
    </label>
  );
}
