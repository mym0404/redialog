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

Every `PortalHost` has a `hostId`. If omitted, it generates a stable ID with React's `useId()`. To target a host explicitly, pass the same `hostId` to `PortalHost` and `Portal` or `Dialog`. Target hosts can be ancestors or siblings of the caller.

```tsx
import { Button, Text, View } from 'react-native';
import { Dialog, Portal, PortalHost, useDialog } from 'redialog';

const ROOT_HOST_ID = 'root';

function App() {
  const [dialog, { show }] = useDialog();

  return (
    <View style={{ flex: 1 }}>
      <PortalHost hostId={ROOT_HOST_ID}>
        <PortalHost hostId="screen">
          <Button title="Open dialog" onPress={show} />
          <Dialog dialog={{ dialog }} hostId={ROOT_HOST_ID}>
            <Text>This dialog renders in the root host.</Text>
          </Dialog>
          <Portal hostId={ROOT_HOST_ID}>
            <Text>This content also renders in the root host.</Text>
          </Portal>
        </PortalHost>
      </PortalHost>
    </View>
  );
}
```

- Without `hostId`, `Portal` uses the nearest ancestor `PortalHost`. `Dialog` uses that host when `portal` is `true`; otherwise it renders inline.
- Setting `Dialog.hostId` enables portal rendering without requiring `portal={true}`.
- Host IDs are unique across mounted hosts in the same JavaScript runtime. Duplicate IDs throw an error. `Portal.Host` accepts the same props as `PortalHost`.
- If a named host is absent, its portals render nothing until it mounts. They do not fall back to an ancestor host. Removing the host also removes its content; mounting it again restores the active portals.
- Changing `hostId` moves the content to the new host and remounts its children, resetting their local state.
- A host renders portal content at its own position in the native view tree. Choose its surrounding layout to cover the intended area. A generic `Portal` does not create a native modal or manage accessibility focus.

## Screen-reader focus

Portal dialogs manage VoiceOver and TalkBack through the same code, without `accessibilityViewIsModal`. A top-level host has no ancestor `PortalHost`. When its dialog opens, every top-level host hides its normal children from accessibility, including nested hosts and their dialogs. Dialogs keep their original portal destination and layout. Among dialogs in top-level hosts, the most recently mounted dialog remains accessible; closing it exposes the previous one.

```tsx
import { useRef } from 'react';
import { Pressable, Text, type HostInstance } from 'react-native';
import { Dialog, PortalHost, useDialog } from 'redialog';

function AccessibleDialog() {
  const [dialog, { show, hide }] = useDialog();
  const openerRef = useRef<HostInstance>(null);
  const titleRef = useRef<HostInstance>(null);

  return (
    <PortalHost>
      <Pressable ref={openerRef} accessibilityRole="button" onPress={show}>
        <Text>Open settings</Text>
      </Pressable>
      <Dialog
        dialog={{ dialog }}
        portal
        accessibilityLabel="Settings"
        backdropAccessibilityLabel="Dismiss settings"
        initialFocusRef={titleRef}
        returnFocusRef={openerRef}
      >
        <Text ref={titleRef} accessible accessibilityRole="header">
          Settings
        </Text>
        <Pressable accessibilityRole="button" onPress={hide}>
          <Text>Close settings</Text>
        </Pressable>
      </Dialog>
    </PortalHost>
  );
}
```

All label and focus-ref props are optional.

- `accessibilityLabel` names the fallback heading used for initial focus (default: `Dialog`).
- `backdropAccessibilityLabel` names the dismissible backdrop button (default: `Close dialog`). The button is hidden from accessibility when `backdropTouchToClose` is `false`; no backdrop button is rendered when `backdrop` is `false`.
- `initialFocusRef` identifies an accessible native element inside the dialog. Focus moves there after layout and the opening animation. Without it, focus moves to the fallback heading.
- `returnFocusRef` identifies an accessible native element to focus when the last dialog finishes closing. If another dialog remains, that dialog receives its initial focus instead. There is no automatic opener detection.
- Hosts can only hide content they own. Put the screen's content inside top-level hosts to exclude it while a top-level dialog is open. Native navigation, Expo development controls, and other views outside those hosts remain outside this boundary.
- A nested-host dialog hides its own host's normal children. It does not isolate the entire screen; an active dialog in a shallower host takes priority. Inline dialogs do not isolate surrounding views.
- Keep host containers sized to the intended overlay area. Host children use a flex container, with portal content in a separate absolute-fill layer.

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
