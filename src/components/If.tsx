import { type PropsWithChildren, type ReactNode } from "react";

interface IfProps {
  condition: boolean;
}

// eslint-disable-next-line sonarjs/function-return-type
export function If(props: PropsWithChildren<IfProps>): ReactNode {
  return props.condition ? props.children : null;
}
