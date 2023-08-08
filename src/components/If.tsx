import { PropsWithChildren } from "react";

interface IfProps {
    condition: boolean;
}

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
export function If(props: PropsWithChildren<IfProps>) {
    return props.condition ? props.children : null;
}
