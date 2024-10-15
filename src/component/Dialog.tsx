import {
  type PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  useState,
  type RefObject,
  useRef,
  useMemo,
} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  type SharedValue,
  ReduceMotion,
} from 'react-native-reanimated';
import {
  StyleSheet,
  Pressable,
  type StyleProp,
  type ViewStyle,
  View,
  type LayoutChangeEvent,
  type LayoutRectangle,
} from 'react-native';
import { useBackPress } from '../internal/useBackPress';
import { Portal } from '../internal/Portal';
import type { NoobSymbol } from '../internal/type';
import { useStableCallback } from '../internal/useStableCallback';

export type DialogRef<T = NoobSymbol> = T extends NoobSymbol
  ? { show: () => void; hide: () => void }
  : { show: (params: T) => void; hide: () => void };
export type DialogProps<T = NoobSymbol> = PropsWithChildren<{
  dialog?: RefObject<DialogRef<T>>;
  onShowStarted?: () => void;
  onShowEnd?: () => void;
  onHideStarted?: () => void;
  onHideEnd?: () => void;
  backpressToClose?: boolean;
  backdropTouchToClose?: boolean;
  portal?: boolean;
  backdropColor?: string;
  showAnimationValue?: SharedValue<number>;
  style?: StyleProp<ViewStyle>;
  backdrop?: boolean;
  bottomSheet?: boolean;
}>;

export const Dialog = ({
  children,
  dialog,
  ...props
}: PropsWithChildren<
  {
    dialog: Omit<DialogProps<any>, 'children'>;
  } & Omit<DialogProps<any>, 'children' | 'dialog'>
>) => {
  const { dialog: ref, ...propsFromDialog } = dialog;

  const mergedProps = useMemo(() => {
    const ret: any = { ...propsFromDialog, ...props };
    Object.keys(propsFromDialog).forEach((_k) => {
      const k = _k as keyof typeof propsFromDialog;
      if (
        typeof propsFromDialog[k] === 'function' &&
        typeof props[k] === 'function'
      ) {
        ret[k] = (...args: any[]) => {
          (propsFromDialog[k] as Function)(...args);
          (props[k] as Function)(...args);
        };
      }
    });
    return ret;
  }, [propsFromDialog, props]);

  return <_Dialog ref={ref} children={children} {...mergedProps} />;
};

const RePressable = Animated.createAnimatedComponent(Pressable);
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
      style,
      backdrop = true,
      bottomSheet = false,
    },
    ref
  ) => {
    const [isShow, setShow] = useState(false);
    const [isHiding, setHiding] = useState(false);

    const _showValue = useSharedValue(0);
    const showValue = showAnimationValue || _showValue;

    const timeoutHandle = useRef<any>();

    const show = useStableCallback(() => {
      clearTimeout(timeoutHandle.current);
      setHiding(false);
      setShow(true);
      onShowStarted?.();
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
      clearTimeout(timeoutHandle.current);
      onHideStarted?.();
      setHiding(true);
      setShow(false);
      showValue.value = withTiming(0, {
        duration: 200,
        reduceMotion: ReduceMotion.Never,
      });
      timeoutHandle.current = setTimeout(() => {
        onHideEnd?.();
        setHiding(false);
      }, 350);
    });

    const [layout, setLayout] = useState<LayoutRectangle>({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
    const onLayout = (e: LayoutChangeEvent) => {
      setLayout(e.nativeEvent.layout);
    };

    const modalStyle = useAnimatedStyle(() => ({
      transform: [{ scale: interpolate(showValue.value, [0, 1], [1.1, 1]) }],
    }));

    const bottomSheetStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: interpolate(showValue.value, [0, 1], [0, -layout.height]),
        },
      ],
    }));

    useBackPress(isShow && backpressToClose, hide);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    const shouldBeUnmounted = !isShow && !isHiding;

    if (shouldBeUnmounted) return null;

    const element = (
      <View
        aria-modal
        accessible
        style={[
          styles.wrapper,
          bottomSheet ? styles.wrapperBottomSheet : styles.wrapperDialog,
        ]}
        pointerEvents={!isShow ? 'none' : 'box-none'}
      >
        {!backdrop ? null : (
          <RePressable
            aria-hidden={!backdropTouchToClose}
            disabled={!backdropTouchToClose}
            role={'button'}
            accessibilityHint={`Tap to close modal`}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: backdropColor, opacity: showValue },
            ]}
            onPress={hide}
          />
        )}
        <Animated.View
          style={[
            modalStyle,
            style,
            bottomSheet
              ? [
                  bottomSheetStyle,
                  {
                    position: 'absolute',
                    bottom: -layout.height,
                    width: '100%',
                  },
                ]
              : { opacity: showValue },
          ]}
          onLayout={onLayout}
        >
          {children}
        </Animated.View>
      </View>
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
  wrapperBottomSheet: {},
});
