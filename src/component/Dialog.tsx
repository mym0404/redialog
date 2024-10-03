import { useStableCallback, useTimeoutHandlers } from '@mj-studio/react-util';
import type { PropsWithChildren, RefObject } from 'react';
import { useImperativeHandle, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  type SharedValue,
  ReduceMotion,
} from 'react-native-reanimated';
import { StyleSheet, Pressable } from 'react-native';
import { useBackPress } from '../internal/useBackPress';
import { Portal } from '../internal/Portal';
import type { NoobSymbol } from '../internal/type';

export type DialogRef<T = NoobSymbol> = T extends NoobSymbol
  ? { show: () => void; hide: () => void }
  : { show: (params: T) => void; hide: () => void };
export type DialogProps<T = NoobSymbol> = PropsWithChildren<{
  onShowStarted?: () => void;
  onShowEnd?: () => void;
  onHideStarted?: () => void;
  onHideEnd?: () => void;
  backpressToClose?: boolean;
  backdropTouchToClose?: boolean;
  portal?: boolean;
  backdropColor?: string;
  showAnimationValue?: SharedValue<number>;
}> & {
  dialog: RefObject<DialogRef<T>>;
};

export const Dialog = ({
  dialog,
  children,
}: PropsWithChildren<{
  dialog: Omit<DialogProps<any>, 'children'>;
}>) => {
  const {
    onHideEnd,
    onHideStarted,
    onShowEnd,
    onShowStarted,
    backpressToClose = true,
    backdropTouchToClose = true,
    portal = false,
    backdropColor = '#111a',
    showAnimationValue,
    dialog: ref,
  } = dialog;
  const { setAutoClearTimeout, clearAllTimers } = useTimeoutHandlers();

  const [isShow, setShow] = useState(false);
  const [isHiding, setHiding] = useState(false);

  const _showValue = useSharedValue(0);
  const showValue = showAnimationValue || _showValue;

  const show = useStableCallback(() => {
    clearAllTimers();
    setHiding(false);
    setShow(true);
    onShowStarted?.();
    showValue.value = withTiming(
      1,
      { duration: 250, reduceMotion: ReduceMotion.Never },
      (finished) => {
        if (finished) {
          onShowEnd?.();
        }
      }
    );
  });
  const hide = useStableCallback(() => {
    if (isHiding || !isShow) {
      return;
    }
    onHideStarted?.();
    setHiding(true);
    setAutoClearTimeout(() => {
      onHideEnd?.();
      setHiding(false);
    }, 400);
    setShow(false);
    showValue.value = withTiming(0, {
      duration: 200,
      reduceMotion: ReduceMotion.Never,
    });
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: showValue.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(showValue.value, [0, 1], [1.1, 1]) }],
  }));

  useBackPress(isShow && backpressToClose, hide);

  useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

  const element = (
    <Animated.View
      aria-modal
      style={[styles.wrapper, styles.wrapperDialog, containerStyle]}
      pointerEvents={!isShow ? 'none' : 'box-none'}
    >
      {backdropTouchToClose && (
        <Pressable
          role={'button'}
          accessibilityHint={`Tap to close modal`}
          style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }]}
          onPress={hide}
        />
      )}
      <Animated.View style={modalStyle}>{children}</Animated.View>
    </Animated.View>
  );
  if (portal) {
    return <Portal>{element}</Portal>;
  } else {
    return element;
  }
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wrapperDialog: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
