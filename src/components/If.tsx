import type { PropsWithChildren, ReactNode } from "react";

interface IfProps {
  condition: boolean;
}

export function If({ condition, children }: PropsWithChildren<IfProps>): ReactNode {
  return condition ? children : null;
}
