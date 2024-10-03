import type { ReactNode, ComponentType } from 'react';
import type { DialogProps } from './Dialog';
import { useDialog } from '../hook/useDialog';

export function DialogHandle(props: {
  children?: (
    params: {
      dialog: ReturnType<typeof useDialog>[0];
    } & ReturnType<typeof useDialog>[1] & { show: () => void }
  ) => ReactNode;
}): ReactNode;

export function DialogHandle<T extends ComponentType<DialogProps<any>>>(props: {
  children?: (
    params: {
      dialog: ReturnType<typeof useDialog<T>>[0];
    } & ReturnType<typeof useDialog<T>>[1]
  ) => ReactNode;
}): ReactNode;

export function DialogHandle({
  children,
}: {
  children?: (...args: any[]) => any;
}): never {
  const [dialog, params] = useDialog();
  return children?.({ dialog, ...params }) as never;
}
