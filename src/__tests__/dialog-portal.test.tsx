import { Button, Text, View } from 'react-native';
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

it('routes a visible Dialog by portalId and removes it after hiding', async () => {
  jest.useFakeTimers();
  const firstHost = 'first';
  const secondHost = 'second';
  const content = 'Dialog content';
  const showLabel = 'Show dialog';
  const hideLabel = 'Hide dialog';

  function App({ portalId }: { portalId: string }) {
    const [dialog, { show, hide }] = useDialog();
    return (
      <>
        <Button title={showLabel} onPress={show} />
        <Button title={hideLabel} onPress={hide} />
        <View testID={firstHost}>
          <PortalHost portalId={firstHost}>{null}</PortalHost>
        </View>
        <View testID={secondHost}>
          <PortalHost portalId={secondHost}>{null}</PortalHost>
        </View>
        <Dialog dialog={{ dialog }} portalId={portalId}>
          <Text>{content}</Text>
        </Dialog>
      </>
    );
  }

  try {
    await render(<App portalId={firstHost} />);
    expect(screen.queryByText(content)).toBeNull();
    await fireEvent.press(screen.getByText(showLabel));
    await act(() => jest.runAllTimers());
    expect(
      within(screen.getByTestId(firstHost)).getByText(content)
    ).toBeOnTheScreen();

    await screen.rerender(<App portalId={secondHost} />);
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
