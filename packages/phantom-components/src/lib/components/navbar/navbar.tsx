import React from "react";
import styles from "./navbar.module.css";

interface NavbarProps {
  children: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ children }) => {
  return (
    <nav>
      <ul className={`${styles.root} ${styles["nav-items"]}`}>{children}</ul>
    </nav>
  );
};

export default Navbar;
