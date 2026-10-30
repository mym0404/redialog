# redialog

Simple & Easy React Native Dialog using Reanimated

## Description

Redialog is a React Native Dialog component focused on simplicity and ease of use, utilizing Reanimated for animations.

It supports both **Dialog** and **BottomSheet** modes.

Redialog only has two states: showing and hiding. With the `useDialog` and `useDialogProps` hooks, it makes creating custom Dialog components very easy.

Additionally, it fully supports TypeScript and ensures type safety by distinguishing between Dialogs with and without arguments in the `show` function.

## Installation

```sh
pnpm add redialog react-native-reanimated@4 react-native-worklets
```

Version 1 requires Reanimated 4 and the React Native New Architecture. Choose React Native and Worklets versions supported by your installed Reanimated version using its [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/). Reanimated 3 and the Legacy Architecture are no longer supported.

Add `react-native-worklets/plugin` last in your app's Babel plugins, then rebuild the native app. See the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) for platform-specific setup. Expo apps should use `pnpm exec expo install react-native-reanimated react-native-worklets` to select versions compatible with their SDK; the example uses Expo SDK 58.

## Usage

Core components for usage

- `useDialog`
- `useDialogProps`
- `Dialog`
- `DialogHandler`

```tsx
export default function App() {
  const [paramsDialog, { show: showParamsDialog, hide: hideParamsDialog }] =
    useDialog<typeof ParamsDialog>();
  const [
    noParamsDialog,
    { show: showNoParamsDialog, hide: hideNoParamsDialog },
  ] = useDialog();

  return (
    <View>
      {/* Hook, with params */}
      <ParamsDialog dialog={paramsDialog} />
      {/* Hook, without params */}
      <NoParamsDialog dialog={noParamsDialog} />
      {/* Component, with params */}
      <DialogHandle<typeof ParamsDialog>>
        {({ show, hide, dialog }) => <ParamsDialog dialog={dialog} />}
      </DialogHandle>
      {/* Component, without params */}
      <DialogHandle>
        {({ show, hide, dialog }) => <NoParamsDialog dialog={dialog} />}
      </DialogHandle>
      {/* BottomSheet */}
      <DialogHandle>
        {({ show, hide, dialog }) => <BottomSheetDialog dialog={dialog} />}
      </DialogHandle>
    </View>
  );
}

type ParamsDialogParams = {
  data: number;
};

const ParamsDialog = (props: DialogProps<ParamsDialogParams>) => {
  const [dialog] = useDialogProps(props);
  return <Dialog dialog={dialog}>...</Dialog>;
};

const NoParamsDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);
  return <Dialog dialog={dialog}>...</Dialog>;
};

const BottomSheetDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);
  return (
    <Dialog dialog={dialog} bottomSheet>
      ...
    </Dialog>
  );
};
```

## Targeting a PortalHost

Give each named `PortalHost` a unique `portalId`, then pass that ID to `Portal` or `Dialog` to render its content in that host. Named hosts can be ancestors or siblings of the caller.

```tsx
import { Button, Text, View } from 'react-native';
import { Dialog, Portal, PortalHost, useDialog } from 'redialog';

const ROOT_PORTAL_ID = 'root';

function App() {
  const [dialog, { show }] = useDialog();

  return (
    <View style={{ flex: 1 }}>
      <PortalHost portalId={ROOT_PORTAL_ID}>
        <PortalHost portalId="screen">
          <Button title="Open dialog" onPress={show} />
          <Dialog dialog={{ dialog }} portalId={ROOT_PORTAL_ID}>
            <Text>This dialog renders in the root host.</Text>
          </Dialog>
          <Portal portalId={ROOT_PORTAL_ID}>
            <Text>This content also renders in the root host.</Text>
          </Portal>
        </PortalHost>
      </PortalHost>
    </View>
  );
}
```

- Without `portalId`, `Portal` uses the nearest ancestor `PortalHost`. `Dialog` uses that host when `portal` is `true`; otherwise it renders inline.
- Setting `Dialog.portalId` enables portal rendering without requiring `portal={true}`.
- Named IDs are unique across mounted hosts in the same JavaScript runtime. Duplicate IDs throw an error. `Portal.Host` accepts the same props as `PortalHost`.
- If a named host is absent, its portals render nothing until it mounts. They do not fall back to an ancestor host. Removing the host also removes its content; mounting it again restores the active portals.
- Changing `portalId` moves the content to the new host and remounts its children, resetting their local state.
- A host renders portal content at its own position in the native view tree. Choose its surrounding layout to cover the intended area; targeting a host does not create a native modal or an accessibility focus trap.

## Full Example

```tsx
import { View, Button, Text } from 'react-native';
import {
  Dialog,
  useDialog,
  type DialogProps,
  useDialogProps,
  DialogHandle,
} from 'redialog';
import { useState } from 'react';

export default function App() {
  const [paramsDialog, { show: showParamsDialog, hide: hideParamsDialog }] =
    useDialog<typeof ParamsDialog>();
  const [
    noParamsDialog,
    { show: showNoParamsDialog, hide: hideNoParamsDialog },
  ] = useDialog();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Hook, with params */}
      <Button title={'Show'} onPress={() => showParamsDialog({ data: 1 })} />
      <Button title={'Hide'} onPress={hideParamsDialog} />
      <ParamsDialog dialog={paramsDialog} />
      {/* Hook, without params */}
      <Button title={'Show'} onPress={showNoParamsDialog} />
      <Button title={'Hide'} onPress={hideNoParamsDialog} />
      <NoParamsDialog dialog={noParamsDialog} />
      {/* Component, with params */}
      <DialogHandle<typeof ParamsDialog>>
        {({ show, hide, dialog }) => (
          <>
            <Button title={'Show'} onPress={() => show({ data: 1 })} />
            <Button title={'Hide'} onPress={hide} />
            <ParamsDialog dialog={dialog} />
          </>
        )}
      </DialogHandle>
      {/* Component, without params */}
      <DialogHandle>
        {({ show, hide, dialog }) => (
          <>
            <Button title={'Show'} onPress={show} />
            <Button title={'Hide'} onPress={hide} />
            <NoParamsDialog dialog={dialog} />
          </>
        )}
      </DialogHandle>
      {/* BottomSheet */}
      <DialogHandle>
        {({ show, hide, dialog }) => (
          <>
            <Button title={'Show'} onPress={show} />
            <Button title={'Hide'} onPress={hide} />
            <BottomSheetDialog dialog={dialog} />
          </>
        )}
      </DialogHandle>
    </View>
  );
}

type ParamsDialogParams = {
  data: number;
};

const ParamsDialog = (props: DialogProps<ParamsDialogParams>) => {
  const [dialog] = useDialogProps(props);
  const [count, setCount] = useState(0);
  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#eee', gap: 16 }}>
        {Array(count)
          .fill(0)
          .map((_, i) => {
            return (
              <View
                key={i}
                style={{ width: 100, height: 100, backgroundColor: 'red' }}
              />
            );
          })}
        <Text>Hello</Text>
        <Button title={'Add'} onPress={() => setCount((c) => c + 1)} />
      </View>
    </Dialog>
  );
};

const NoParamsDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);

  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#eee' }} />
    </Dialog>
  );
};

const BottomSheetDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);
  const [count, setCount] = useState(0);
  return (
    <Dialog dialog={dialog} bottomSheet style={{ backgroundColor: 'red' }}>
      <View style={{ padding: 100, backgroundColor: 'transparent' }}>
        {Array(count)
          .fill(0)
          .map((_, i) => {
            return (
              <View
                key={i}
                style={{ width: 100, height: 100, backgroundColor: 'blue' }}
              />
            );
          })}
        <Text>Hello</Text>
        <Button title={'Add'} onPress={() => setCount((c) => c + 1)} />
      </View>
    </Dialog>
  );
};
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
