import {
  createContext,
  useContext,
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  AccessibilityInfo,
  type HostInstance,
  StyleSheet,
  View,
} from 'react-native';

import { useStableCallback } from './useStableCallback';
import { useBackPress } from './useBackPress';

type PortalLayer = { hostId: string; depth: number; key: number };
type ActiveDialog = { id: string; layer?: PortalLayer };

export const PortalLayerContext = createContext<PortalLayer | undefined>(
  undefined
);

const dialogs: ActiveDialog[] = [];
const listeners = new Set<() => void>();
let activeDialog: ActiveDialog | undefined;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const notify = () => {
  const nextActiveDialog = dialogs.reduce<ActiveDialog | undefined>(
    (active, dialog) => {
      const depth = dialog.layer?.depth ?? Infinity;
      const activeDepth = active?.layer?.depth ?? Infinity;
      return depth <= activeDepth ? dialog : active;
    },
    undefined
  );
  if (activeDialog === nextActiveDialog) return;
  activeDialog = nextActiveDialog;
  listeners.forEach((listener) => listener());
};

export const useActiveDialog = <T,>(
  select: (active: ActiveDialog | undefined) => T
) =>
  useSyncExternalStore(
    subscribe,
    () => select(activeDialog),
    () => select(undefined)
  );

export function DialogAccessibility({
  id,
  label,
  isReady,
  backpressToClose,
  onClose,
  initialFocusRef,
  returnFocusRef,
  children,
}: PropsWithChildren<{
  id: string;
  label: string;
  isReady: boolean;
  backpressToClose: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HostInstance | null>;
  returnFocusRef?: RefObject<HostInstance | null>;
}>) {
  const layer = useContext(PortalLayerContext);
  const isActive = useActiveDialog((active) => active?.id === id);
  useBackPress(isActive && backpressToClose, onClose);
  const [hasLayout, setHasLayout] = useState(false);
  const fallbackFocusRef = useRef<HostInstance>(null);
  const restoreFocus = useStableCallback(() => {
    const target = returnFocusRef?.current;
    if (target) AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  });

  useLayoutEffect(() => {
    const entry = { id, layer };
    dialogs.push(entry);
    notify();
    return () => {
      dialogs.splice(dialogs.indexOf(entry), 1);
      notify();
      if (!activeDialog) {
        requestAnimationFrame(() => {
          if (!activeDialog) restoreFocus();
        });
      }
    };
  }, [id, layer, restoreFocus]);

  useEffect(() => {
    if (!isActive || !isReady || !hasLayout) return;
    const frame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? fallbackFocusRef.current;
      if (activeDialog?.id === id && target) {
        AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [id, isActive, isReady, hasLayout, initialFocusRef]);

  return (
    <View
      collapsable={false}
      aria-hidden={!isActive}
      pointerEvents={isActive ? 'box-none' : 'none'}
      style={StyleSheet.absoluteFill}
      onLayout={() => setHasLayout(true)}
    >
      <View
        ref={fallbackFocusRef}
        accessible
        accessibilityLabel={label}
        accessibilityRole="header"
        style={styles.focusTarget}
      />
      <PortalLayerContext.Provider value={undefined}>
        {children}
      </PortalLayerContext.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  focusTarget: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
});
