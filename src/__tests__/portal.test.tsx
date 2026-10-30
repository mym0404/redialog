import { StrictMode, useLayoutEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { Portal } from '../internal/Portal/Portal';
import { PortalHost } from '../internal/Portal/PortalHost';

const OUTER = 'outer';
const INNER = 'inner';
const SIBLING = 'sibling';
const CONTENT = 'Portal content';

function Hosts({
  portalId,
  hasSibling = true,
  siblingId = SIBLING,
  children = CONTENT,
}: {
  portalId?: string;
  hasSibling?: boolean;
  siblingId?: string;
  children?: string;
}) {
  return (
    <>
      <View testID={OUTER}>
        <PortalHost portalId={OUTER}>
          <View testID={INNER}>
            <PortalHost portalId={INNER}>
              <Portal portalId={portalId}>
                <Text>{children}</Text>
              </Portal>
            </PortalHost>
          </View>
        </PortalHost>
      </View>
      {hasSibling && (
        <View testID={SIBLING}>
          <PortalHost portalId={siblingId}>{null}</PortalHost>
        </View>
      )}
    </>
  );
}

it('uses the nearest host when portalId is omitted', async () => {
  await render(<Hosts />);

  expect(
    within(screen.getByTestId(INNER)).getByText(CONTENT)
  ).toBeOnTheScreen();
  expect(within(screen.getByTestId(SIBLING)).queryByText(CONTENT)).toBeNull();
});

it('targets an outer host instead of the nearest host', async () => {
  await render(<Hosts portalId={OUTER} />);

  expect(
    within(screen.getByTestId(OUTER)).getByText(CONTENT)
  ).toBeOnTheScreen();
  expect(within(screen.getByTestId(INNER)).queryByText(CONTENT)).toBeNull();
});

it('targets a sibling host mounted after the portal', async () => {
  await render(<Hosts portalId={SIBLING} />);

  expect(
    within(screen.getByTestId(SIBLING)).getByText(CONTENT)
  ).toBeOnTheScreen();
  expect(within(screen.getByTestId(OUTER)).queryByText(CONTENT)).toBeNull();
});

it('moves content when portalId changes and can return to the nearest host', async () => {
  await render(<Hosts portalId={OUTER} />);
  await screen.rerender(<Hosts portalId={SIBLING} />);

  expect(within(screen.getByTestId(OUTER)).queryByText(CONTENT)).toBeNull();
  expect(
    within(screen.getByTestId(SIBLING)).getByText(CONTENT)
  ).toBeOnTheScreen();

  await screen.rerender(<Hosts />);

  expect(
    within(screen.getByTestId(INNER)).getByText(CONTENT)
  ).toBeOnTheScreen();
  expect(within(screen.getByTestId(SIBLING)).queryByText(CONTENT)).toBeNull();
  expect(screen.getAllByText(CONTENT)).toHaveLength(1);
});

it('waits for a named host without falling back, including after host removal', async () => {
  await render(<Hosts portalId={SIBLING} hasSibling={false} />);
  expect(screen.queryByText(CONTENT)).toBeNull();

  await screen.rerender(<Hosts portalId={SIBLING} />);
  expect(screen.getByText(CONTENT)).toBeOnTheScreen();

  await screen.rerender(<Hosts portalId={SIBLING} hasSibling={false} />);
  expect(screen.queryByText(CONTENT)).toBeNull();

  await screen.rerender(<Hosts portalId={SIBLING} />);
  expect(screen.getAllByText(CONTENT)).toHaveLength(1);
});

it('updates host registration when the host ID changes', async () => {
  const renamedId = 'renamed';
  await render(<Hosts portalId={SIBLING} />);
  await screen.rerender(<Hosts portalId={SIBLING} siblingId={renamedId} />);
  expect(screen.queryByText(CONTENT)).toBeNull();

  await screen.rerender(<Hosts portalId={renamedId} siblingId={renamedId} />);
  expect(
    within(screen.getByTestId(SIBLING)).getByText(CONTENT)
  ).toBeOnTheScreen();
});

it('updates portal children without leaving stale content', async () => {
  const updatedContent = 'Updated content';
  await render(<Hosts portalId={SIBLING} />);
  await screen.rerender(<Hosts portalId={SIBLING}>{updatedContent}</Hosts>);

  expect(screen.queryByText(CONTENT)).toBeNull();
  expect(
    within(screen.getByTestId(SIBLING)).getByText(updatedContent)
  ).toBeOnTheScreen();
});

it('keeps child state when its host rerenders', async () => {
  const increment = 'Increment';
  function Counter() {
    const [count, setCount] = useState(0);
    return (
      <>
        <Text>{count}</Text>
        <Button title={increment} onPress={() => setCount(count + 1)} />
      </>
    );
  }

  function App({ label }: { label: string }) {
    return (
      <PortalHost portalId={OUTER}>
        <Text>{label}</Text>
        <Portal>
          <Counter />
        </Portal>
      </PortalHost>
    );
  }

  await render(<App label="Before" />);
  await fireEvent.press(screen.getByText(increment));
  await screen.rerender(<App label="After" />);
  expect(screen.getByText('1')).toBeOnTheScreen();
});

it('does not duplicate portals under StrictMode and releases IDs on unmount', async () => {
  await render(
    <StrictMode>
      <Hosts portalId={SIBLING} />
    </StrictMode>
  );
  expect(screen.getAllByText(CONTENT)).toHaveLength(1);
  await screen.unmount();

  await render(<Hosts portalId={SIBLING} />);
  expect(screen.getAllByText(CONTENT)).toHaveLength(1);
});

it('rejects duplicate host IDs', async () => {
  await expect(
    render(
      <>
        <PortalHost portalId={OUTER}>{null}</PortalHost>
        <PortalHost portalId={OUTER}>{null}</PortalHost>
      </>
    )
  ).rejects.toThrow(`A PortalHost with portalId "${OUTER}" already exists`);
});

it('removes only the unmounted portal from a shared host', async () => {
  const otherContent = 'Other portal';
  function App({ hasFirst }: { hasFirst: boolean }) {
    return (
      <PortalHost portalId={OUTER}>
        {hasFirst && (
          <Portal portalId={OUTER}>
            <Text>{CONTENT}</Text>
          </Portal>
        )}
        <Portal portalId={OUTER}>
          <Text>{otherContent}</Text>
        </Portal>
      </PortalHost>
    );
  }

  await render(<App hasFirst />);
  expect(screen.getByText(CONTENT)).toBeOnTheScreen();
  await screen.rerender(<App hasFirst={false} />);
  expect(screen.queryByText(CONTENT)).toBeNull();
  expect(screen.getByText(otherContent)).toBeOnTheScreen();
});

it('does not mount stale content if the portal unmounts before its deferred mount', async () => {
  function App() {
    const [isVisible, setVisible] = useState(true);
    useLayoutEffect(() => setVisible(false), []);
    return (
      <PortalHost>
        {isVisible && (
          <Portal>
            <Text>{CONTENT}</Text>
          </Portal>
        )}
      </PortalHost>
    );
  }

  await render(<App />);
  expect(screen.queryByText(CONTENT)).toBeNull();
});

it('supports named portals without an ancestor host', async () => {
  await render(
    <>
      <Portal portalId={OUTER}>
        <Text>{CONTENT}</Text>
      </Portal>
      <View testID={OUTER}>
        <Portal.Host portalId={OUTER}>{null}</Portal.Host>
      </View>
    </>
  );
  expect(
    within(screen.getByTestId(OUTER)).getByText(CONTENT)
  ).toBeOnTheScreen();
});
