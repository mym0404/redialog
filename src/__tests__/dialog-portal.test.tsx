import { createRef, Profiler, useLayoutEffect } from 'react';
import {
  AccessibilityInfo,
  Button,
  type HostInstance,
  Platform,
  Text,
  View,
} from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { Dialog } from '../component/Dialog';
import { PortalHost } from '../internal/Portal/PortalHost';
import { useDialog } from '../hook/useDialog';

jest.mock('react-native-reanimated', () => {
  const { View: NativeView } =
    jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: {
      View: NativeView,
      createAnimatedComponent: <T,>(component: T) => component,
    },
    useSharedValue: <T,>(value: T) => ({ value }),
    useAnimatedStyle: () => ({}),
    withTiming: <T,>(value: T) => value,
    ReduceMotion: { Never: 'never' },
  };
});

it('routes a visible Dialog by hostId and removes it after hiding', async () => {
  jest.useFakeTimers();
  const firstHost = 'first';
  const secondHost = 'second';
  const content = 'Dialog content';
  const showLabel = 'Show dialog';
  const hideLabel = 'Hide dialog';

  function App({ hostId }: { hostId: string }) {
    const [dialog, { show, hide }] = useDialog();
    return (
      <>
        <Button title={showLabel} onPress={show} />
        <Button title={hideLabel} onPress={hide} />
        <View testID={firstHost}>
          <PortalHost hostId={firstHost}>{null}</PortalHost>
        </View>
        <View testID={secondHost}>
          <PortalHost hostId={secondHost}>{null}</PortalHost>
        </View>
        <Dialog dialog={{ dialog }} hostId={hostId}>
          <Text>{content}</Text>
        </Dialog>
      </>
    );
  }

  try {
    await render(<App hostId={firstHost} />);
    expect(screen.queryByText(content)).toBeNull();
    await fireEvent.press(screen.getByText(showLabel));
    await act(() => jest.runAllTimers());
    expect(
      within(screen.getByTestId(firstHost)).getByText(content)
    ).toBeOnTheScreen();

    await screen.rerender(<App hostId={secondHost} />);
    expect(
      within(screen.getByTestId(firstHost)).queryByText(content)
    ).toBeNull();
    expect(
      within(screen.getByTestId(secondHost)).getByText(content)
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByText(hideLabel));
    await act(() => jest.runAllTimers());
    expect(screen.queryByText(content)).toBeNull();
    await screen.unmount();
  } finally {
    jest.useRealTimers();
  }
});

const BACKGROUND = 'Main content';
const SIBLING_BACKGROUND = 'Sibling content';
const FIRST_DIALOG = 'First dialog';
const SECOND_DIALOG = 'Second dialog';
const NESTED_DIALOG = 'Nested dialog';
const FIRST_HOST = 'main';
const SECOND_HOST = 'sibling';
const NESTED_HOST = 'nested';
const FIRST_ACTION = 'First action';
const CLOSE_FIRST = 'Close first';
const CLOSE_SECOND = 'Close second';
const FIRST_BACKDROP = 'Dismiss first dialog';

async function renderAccessibleDialogs() {
  const firstFocus = createRef<HostInstance>();
  const returnFocus = createRef<HostInstance>();
  const commands = {
    first: { show: () => {}, hide: () => {} },
    second: { show: () => {}, hide: () => {} },
    nested: { show: () => {}, hide: () => {} },
  };

  function App({ hasFirstHost = true }: { hasFirstHost?: boolean }) {
    const [first, firstCommands] = useDialog();
    const [second, secondCommands] = useDialog();
    const [nested, nestedCommands] = useDialog();
    useLayoutEffect(() => {
      commands.first = firstCommands;
      commands.second = secondCommands;
      commands.nested = nestedCommands;
    });
    return (
      <>
        {hasFirstHost && (
          <PortalHost hostId={FIRST_HOST}>
            <View
              accessible
              ref={returnFocus}
              accessibilityLabel={BACKGROUND}
            />
            <PortalHost hostId={NESTED_HOST}>
              <Text>Nested content</Text>
              <Dialog
                dialog={{ dialog: nested }}
                portal
                accessibilityLabel={NESTED_DIALOG}
              >
                <Button
                  title={NESTED_DIALOG}
                  accessibilityLabel={NESTED_DIALOG}
                  onPress={nestedCommands.hide}
                />
              </Dialog>
            </PortalHost>
            <Dialog
              dialog={{ dialog: first }}
              portal
              accessibilityLabel={FIRST_DIALOG}
              backdropAccessibilityLabel={FIRST_BACKDROP}
              initialFocusRef={firstFocus}
              returnFocusRef={returnFocus}
            >
              <View
                accessible
                ref={firstFocus}
                accessibilityLabel={FIRST_ACTION}
              />
              <Button
                title={CLOSE_FIRST}
                accessibilityLabel={CLOSE_FIRST}
                onPress={firstCommands.hide}
              />
            </Dialog>
          </PortalHost>
        )}
        <PortalHost hostId={SECOND_HOST}>
          <Text>{SIBLING_BACKGROUND}</Text>
          <Dialog
            dialog={{ dialog: second }}
            portal
            accessibilityLabel={SECOND_DIALOG}
          >
            <Button
              title={CLOSE_SECOND}
              accessibilityLabel={CLOSE_SECOND}
              onPress={secondCommands.hide}
            />
          </Dialog>
        </PortalHost>
      </>
    );
  }

  await render(<App />);
  return {
    commands,
    firstFocus,
    returnFocus,
    removeFirstHost: () => screen.rerender(<App hasFirstHost={false} />),
  };
}

async function finishAnimation() {
  await act(() => jest.advanceTimersByTime(400));
  await act(() => jest.advanceTimersByTime(32));
}

describe.each(['ios', 'android'] as const)(
  'dialog accessibility on %s',
  (platform) => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', platform);
      jest.useFakeTimers();
      jest.mocked(AccessibilityInfo.sendAccessibilityEvent).mockClear();
    });
    afterEach(async () => {
      await screen.unmount();
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('hides all root content, including nested dialogs, and restores it after closing', async () => {
      const { commands } = await renderAccessibleDialogs();
      await act(commands.nested.show);
      await finishAnimation();
      expect(
        screen.getByRole('button', { name: NESTED_DIALOG })
      ).toBeOnTheScreen();

      await act(commands.first.show);
      await finishAnimation();
      expect(screen.queryByLabelText(BACKGROUND)).toBeNull();
      expect(screen.queryByText(SIBLING_BACKGROUND)).toBeNull();
      expect(screen.queryByRole('button', { name: NESTED_DIALOG })).toBeNull();
      expect(
        screen.getByRole('button', {
          name: NESTED_DIALOG,
          includeHiddenElements: true,
        })
      ).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: CLOSE_FIRST })
      ).toBeOnTheScreen();

      await act(commands.first.hide);
      await finishAnimation();
      expect(screen.getByLabelText(BACKGROUND)).toBeOnTheScreen();
      expect(screen.getByText(SIBLING_BACKGROUND)).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: NESTED_DIALOG })
      ).toBeOnTheScreen();
    });

    it('keeps only the latest root dialog accessible and does not let a nested dialog steal it', async () => {
      const { commands } = await renderAccessibleDialogs();
      await act(commands.first.show);
      await act(commands.second.show);
      await act(commands.nested.show);
      await finishAnimation();
      expect(screen.queryByRole('button', { name: CLOSE_FIRST })).toBeNull();
      expect(screen.queryByRole('button', { name: NESTED_DIALOG })).toBeNull();
      expect(
        screen.getByRole('button', { name: CLOSE_SECOND })
      ).toBeOnTheScreen();

      await act(commands.second.hide);
      await finishAnimation();
      expect(
        screen.getByRole('button', { name: CLOSE_FIRST })
      ).toBeOnTheScreen();
      expect(screen.queryByText(SIBLING_BACKGROUND)).toBeNull();
    });

    it('releases isolation when the active host unmounts', async () => {
      const { commands, removeFirstHost } = await renderAccessibleDialogs();
      await act(commands.first.show);
      await finishAnimation();
      expect(screen.queryByText(SIBLING_BACKGROUND)).toBeNull();
      await removeFirstHost();
      await finishAnimation();
      expect(screen.getByText(SIBLING_BACKGROUND)).toBeOnTheScreen();
    });

    it('focuses the requested element after layout and restores the opener after dismissal', async () => {
      const { commands, firstFocus, returnFocus } =
        await renderAccessibleDialogs();
      await act(commands.first.show);
      const boundary = screen.getByLabelText(FIRST_DIALOG).parent;
      if (!boundary) throw new Error('Missing dialog accessibility boundary');
      await fireEvent(boundary, 'layout');
      await finishAnimation();
      expect(firstFocus.current).not.toBeNull();
      expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenLastCalledWith(
        firstFocus.current,
        'focus'
      );
      await act(commands.first.hide);
      await finishAnimation();
      expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenLastCalledWith(
        returnFocus.current,
        'focus'
      );
    });

    it('does not move initial focus when dismissed before the show animation ends', async () => {
      const { commands, firstFocus } = await renderAccessibleDialogs();
      await act(commands.first.show);
      const boundary = screen.getByLabelText(FIRST_DIALOG).parent;
      if (!boundary) throw new Error('Missing dialog accessibility boundary');
      await fireEvent(boundary, 'layout');
      const target = firstFocus.current;
      await act(commands.first.hide);
      await finishAnimation();
      expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalledWith(
        target,
        'focus'
      );
    });

    it('labels dismissible backdrops and closes the corresponding dialog', async () => {
      const { commands } = await renderAccessibleDialogs();
      await act(commands.first.show);
      await finishAnimation();
      await fireEvent.press(
        screen.getByRole('button', { name: FIRST_BACKDROP })
      );
      await finishAnimation();
      expect(screen.queryByLabelText(FIRST_DIALOG)).toBeNull();
      expect(screen.getByLabelText(BACKGROUND)).toBeOnTheScreen();

      await act(commands.second.show);
      await finishAnimation();
      await fireEvent.press(
        screen.getByRole('button', { name: 'Close dialog' })
      );
      await finishAnimation();
      expect(screen.queryByLabelText(SECOND_DIALOG)).toBeNull();
      expect(screen.getByText(SIBLING_BACKGROUND)).toBeOnTheScreen();
    });

    it('skips return focus when another dialog opens before the next frame', async () => {
      const { commands, returnFocus } = await renderAccessibleDialogs();
      await act(commands.first.show);
      await finishAnimation();
      jest.mocked(AccessibilityInfo.sendAccessibilityEvent).mockClear();

      await act(commands.first.hide);
      await act(() => jest.advanceTimersByTime(350));
      await act(commands.second.show);
      await finishAnimation();
      expect(
        screen.getByRole('button', { name: CLOSE_SECOND })
      ).toBeOnTheScreen();
      expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalledWith(
        returnFocus.current,
        'focus'
      );
    });

    it('does not let an inline child claim its parent portal layer', async () => {
      let showInner = () => {};
      function App() {
        const [outer, outerControls] = useDialog();
        const [inner, innerControls] = useDialog();
        useLayoutEffect(() => {
          outerControls.show();
          showInner = innerControls.show;
        }, [outerControls, innerControls]);
        return (
          <PortalHost>
            <Dialog dialog={{ dialog: outer }} portal>
              <Text>{FIRST_DIALOG}</Text>
              <Dialog dialog={{ dialog: inner }}>
                <Text>{NESTED_DIALOG}</Text>
              </Dialog>
            </Dialog>
          </PortalHost>
        );
      }
      await render(<App />);
      await act(showInner);
      await finishAnimation();
      expect(screen.getByText(FIRST_DIALOG)).toBeOnTheScreen();
      expect(screen.queryByText(NESTED_DIALOG)).toBeNull();
      expect(
        screen.getByText(NESTED_DIALOG, { includeHiddenElements: true })
      ).toBeOnTheScreen();
    });
  }
);

it('does not commit closed dialogs when another dialog becomes active', async () => {
  jest.useFakeTimers();
  const onClosedDialogRender = jest.fn();
  let show = () => {};

  function ClosedDialog() {
    const [dialog] = useDialog();
    return (
      <Profiler id="closed-dialog" onRender={onClosedDialogRender}>
        <Dialog dialog={{ dialog }} portal>
          <Text>Closed dialog</Text>
        </Dialog>
      </Profiler>
    );
  }
  function App() {
    const [dialog, controls] = useDialog();
    useLayoutEffect(() => {
      show = controls.show;
    }, [controls]);
    return (
      <PortalHost>
        <Dialog dialog={{ dialog }} portal>
          <Text>{FIRST_DIALOG}</Text>
        </Dialog>
        {Array.from({ length: 20 }, (_, index) => (
          <ClosedDialog key={index} />
        ))}
      </PortalHost>
    );
  }

  try {
    await render(<App />);
    onClosedDialogRender.mockClear();
    await act(show);
    await finishAnimation();
    expect(screen.getByText(FIRST_DIALOG)).toBeOnTheScreen();
    expect(onClosedDialogRender).not.toHaveBeenCalled();
    await screen.unmount();
    await act(() => jest.runOnlyPendingTimers());
  } finally {
    jest.useRealTimers();
  }
});
