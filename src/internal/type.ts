import type { RefObject, ComponentType, ComponentProps } from 'react';

export type ExtractShowFromComponent<
  T extends ComponentType<{
    dialog?: RefObject<any>;
  }>,
> = NonNullable<NonNullable<ComponentProps<T>['dialog']>['current']>['show'];

export declare const _NoobSymbol: unique symbol;
export type NoobSymbol = typeof _NoobSymbol;
