import {
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useState,
  type RefObject,
  useRef,
} from 'react';
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
import { useStableCallback } from '../internal/useStableCallback';

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
  dialog: RefObject<DialogRef<T>>;
}>;

export const Dialog = ({
  children,
  dialog: { dialog, ...rest },
}: PropsWithChildren<{
  dialog: Omit<DialogProps<any>, 'children'>;
}>) => {
  return <_Dialog {...rest} ref={dialog} children={children} />;
};

const _Dialog = forwardRef<DialogRef<any>, Omit<DialogProps<any>, 'dialog'>>(
  (
    {
      onHideEnd,
      onHideStarted,
      onShowEnd,
      onShowStarted,
      backpressToClose = true,
      backdropTouchToClose = true,
      portal = false,
      backdropColor = '#111a',
      showAnimationValue,
      children,
    },
    ref
  ) => {
    const [isShow, setShow] = useState(false);
    const [isHiding, setHiding] = useState(false);

    const _showValue = useSharedValue(0);
    const showValue = showAnimationValue || _showValue;

    const timeoutHandle = useRef<any>();

    const show = useStableCallback(() => {
      setHiding(false);
      setShow(true);
      onShowStarted?.();
      clearTimeout(timeoutHandle.current);
      showValue.value = withTiming(1, {
        duration: 250,
        reduceMotion: ReduceMotion.Never,
      });
      timeoutHandle.current = setTimeout(() => {
        onShowEnd?.();
      }, 250);
    });
    const hide = useStableCallback(() => {
      if (isHiding || !isShow) {
        return;
      }
      onHideStarted?.();
      setHiding(true);
      setShow(false);
      clearTimeout(timeoutHandle.current);
      showValue.value = withTiming(0, {
        duration: 200,
        reduceMotion: ReduceMotion.Never,
      });
      timeoutHandle.current = setTimeout(() => {
        onHideEnd?.();
        setHiding(false);
      }, 350);
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
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: backdropColor },
            ]}
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
  }
);

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
