import {
  useState,
  type RefAttributes,
  useMemo,
  useImperativeHandle,
  useRef,
} from 'react';
import type { DialogRef, DialogProps } from 'redialog';
import { useStableCallback } from '@mj-studio/react-util';

export function useDialogProps<T>(props: DialogProps<T>) {
  const [params, setParams] = useState<T>();
  const dialogRef = useRef<DialogRef>(null);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const show = useStableCallback((params: T) => {
    setParams(params);
    dialogRef.current?.show();
  });
  const hide = useStableCallback(() => {
    dialogRef.current?.hide();
  });

  useImperativeHandle(props.dialog, () => ({ show, hide }) as DialogRef<T>, [
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
  ] as const;
}
