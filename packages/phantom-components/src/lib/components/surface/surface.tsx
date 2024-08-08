import cn from "classnames";
import styles from "./surface.module.css";

interface SurfaceProps {
  compact?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Surface = ({
  children,
  compact = false,
  className,
  ...rest
}: SurfaceProps) => {
  return (
    <section
      data-compact={compact}
      className={cn(styles.root, styles.surface, className)}
      {...rest}
    >
      {children}
    </section>
  );
};

export default Surface;
