import type { ReactNode, ComponentType } from 'react';
import { useDialog, type DialogProps } from 'redialog';

export function DialogHandle<T extends ComponentType<DialogProps>>(props: {
  children?: (
    params: {
      dialog: ReturnType<typeof useDialog<T>>[0];
    } & ReturnType<typeof useDialog<T>>[1]
  ) => ReactNode;
}): ReactNode;

export function DialogHandle(props: {
  children?: (
    params: {
      dialog: ReturnType<typeof useDialog>[0];
    } & ReturnType<typeof useDialog>[1]
  ) => ReactNode;
}): ReactNode;

export function DialogHandle({
  children,
}: {
  children?: (...args: any[]) => any;
}) {
  const [dialog, params] = useDialog();
  return children?.({ dialog, ...params });
}
