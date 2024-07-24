import { type PropsWithChildren } from "react";

interface IfProps {
  condition: boolean;
}

export function If(props: PropsWithChildren<IfProps>) {
  return props.condition ? props.children : null;
}
