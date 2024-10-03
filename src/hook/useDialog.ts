import { useRef, type ComponentType, type RefObject } from 'react';
import { useStableCallback } from '@mj-studio/react-util';
import type { ExtractShowFromComponent } from '../internal/type';
import type { DialogProps, DialogRef } from '../component/Dialog';

export function useDialog<T extends ComponentType<DialogProps<any>>>(): [
  RefObject<DialogRef>,
  {
    show: ExtractShowFromComponent<T>;
    hide: () => void;
  },
] {
  const dialogRef = useRef<DialogRef>(null);
  const show = useStableCallback((...args: any[]) =>
    (dialogRef.current as any)?.show(...args)
  );
  const hide = useStableCallback(() => dialogRef.current?.hide());

  return [
    dialogRef,
    {
      show: show as ExtractShowFromComponent<T>,
      hide,
    },
  ];
}
