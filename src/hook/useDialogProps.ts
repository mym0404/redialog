import {
  useState,
  type RefAttributes,
  useMemo,
  useImperativeHandle,
  useRef,
  type RefObject,
} from 'react';
import type { DialogProps, DialogRef } from '../component/Dialog';
import { useStableCallback } from '../internal/useStableCallback';

export function useDialogProps(props: DialogProps): [
  dialogProps: Omit<DialogProps, 'children'> & {
    ref: RefObject<DialogRef<any>>;
  },
  options: {
    show: () => void;
    hide: () => void;
  },
];

export function useDialogProps<T>(props: DialogProps<T>): [
  dialogProps: Omit<DialogProps, 'children'> & {
    ref: RefObject<DialogRef<any>>;
  },
  options: {
    params?: T;
    show: (params: T) => void;
    hide: () => void;
  },
];

export function useDialogProps(props: any) {
  const [params, setParams] = useState();
  const dialogRef = useRef<DialogRef>(null);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const show = useStableCallback((params: any) => {
    setParams(params);
    setTimeout(() => dialogRef.current?.show());
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
      dialog: dialogRef,
      onHideEnd: () => {
        props.onHideEnd?.();
        setParams(undefined);
      },
    };
  }, [props, dialogRef]);

  return [
    dialogProps,
    {
      params,
      show,
      hide,
    },
  ] as any;
}
