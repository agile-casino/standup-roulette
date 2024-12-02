import type { PropsWithChildren, ReactNode } from "react";

interface IfProps {
  condition: boolean;
}

export function If(props: PropsWithChildren<IfProps>): ReactNode {
  return props.condition ? props.children : null;
}
