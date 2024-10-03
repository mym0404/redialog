import { useRef, type ComponentType, type RefObject } from 'react';
import type { ExtractShowFromComponent } from '../internal/type';
import type { DialogProps, DialogRef } from '../component/Dialog';
import { useStableCallback } from '../internal/useStableCallback';

export function useDialog(): [
  RefObject<DialogRef>,
  {
    show: () => void;
    hide: () => void;
  },
];

export function useDialog<T extends ComponentType<DialogProps<any>>>(): [
  RefObject<DialogRef>,
  {
    show: ExtractShowFromComponent<T>;
    hide: () => void;
  },
];

export function useDialog() {
  const dialogRef = useRef<DialogRef>(null);
  const show = useStableCallback((...args: any[]) =>
    (dialogRef.current as any)?.show(...args)
  );
  const hide = useStableCallback(() => dialogRef.current?.hide());

  return [
    dialogRef,
    {
      show,
      hide,
    },
  ];
}
