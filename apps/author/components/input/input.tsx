import React from "react";
import styles from "./input.module.css";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input type={props.type || "text"} {...props} className={styles.root} />
  );
}
