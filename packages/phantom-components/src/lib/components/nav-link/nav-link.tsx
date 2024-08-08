import React, { ReactElement, ReactNode } from "react";
import styles from "./nav-link.module.css";
import cn from "classnames";

interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  active?: boolean | string;
}

export const NavLink = ({
  children,
  active = false,
  ...rest
}: NavLinkProps) => {
  return (
    <>
      {React.cloneElement(children as ReactElement, {
        className: cn(styles.root, styles.link, rest.className),
        "data-active": active ? "true" : "false",
      })}
    </>
  );
};

export default NavLink;
