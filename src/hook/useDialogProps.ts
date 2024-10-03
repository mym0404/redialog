import {
  useState,
  type RefAttributes,
  useMemo,
  useImperativeHandle,
  useRef,
} from 'react';
import type { DialogRef, DialogProps } from 'redialog';
import { useStableCallback } from '@mj-studio/react-util';

export function useDialogProps(
  props: DialogProps,
  extraProps?: Omit<DialogProps, 'children' | 'dialog'>
): [
  dialogProps: Omit<DialogProps, 'children'> & RefAttributes<DialogRef>,
  {
    show: () => void;
    hide: () => void;
  },
];

export function useDialogProps<T>(
  props: DialogProps<T>,
  extraProps?: Omit<DialogProps, 'children' | 'dialog'>
): [
  dialogProps: Omit<DialogProps, 'children'> & RefAttributes<DialogRef>,
  {
    params?: T;
    show: (params: T) => void;
    hide: () => void;
  },
];

export function useDialogProps(
  props: any,
  extraProps: Omit<DialogProps, 'children' | 'dialog'> = {}
) {
  const [params, setParams] = useState();
  const dialogRef = useRef<DialogRef>(null);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const show = useStableCallback((params: any) => {
    setParams(params);
    dialogRef.current?.show();
  });
  const hide = useStableCallback(() => {
    dialogRef.current?.hide();
  });

  useImperativeHandle(props.dialog, () => ({ show, hide }) as DialogRef, [
    show,
    hide,
  ]);

  const dialogProps: Omit<DialogProps<any>, 'children'> &
    RefAttributes<DialogRef> = useMemo(() => {
    return {
      ...props,
      ...extraProps,
      dialog: dialogRef,
      onHideEnd: () => {
        props.onHideEnd?.();
        extraProps?.onHideEnd?.();
        setParams(undefined);
      },
    };
  }, [props, dialogRef, extraProps]);

  return [
    dialogProps,
    {
      params,
      show,
      hide,
    },
  ] as any;
}
