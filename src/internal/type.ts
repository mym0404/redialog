import type { RefObject, ComponentType, ComponentProps } from 'react';

export type ExtractShowFromComponent<
  T extends ComponentType<{
    dialog: RefObject<any>;
  }>,
> = NonNullable<ComponentProps<T>['dialog']['current']>['show'];

const _NoobSymbol = Symbol('noob');
export type NoobSymbol = typeof _NoobSymbol;
