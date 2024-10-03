# redialog

Simple & Easy React Native Dialog using Reanimated

## Description

Redialog is a React Native Dialog component focused on simplicity and ease of use, utilizing Reanimated for animations.

It supports both **Dialog** and **BottomSheet** modes.

Redialog only has two states: showing and hiding. With the `useDialog` and `useDialogProps` hooks, it makes creating custom Dialog components very easy.

Additionally, it fully supports TypeScript and ensures type safety by distinguishing between Dialogs with and without arguments in the `show` function.

## Installation

```sh
yarn add redialog react-native-reanimated
```

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
        {({ show, hide, dialog }) => (
          <ParamsDialog dialog={dialog} />
        )}
      </DialogHandle>
      {/* Component, without params */}
      <DialogHandle>
        {({ show, hide, dialog }) => (
          <NoParamsDialog dialog={dialog} />
        )}
      </DialogHandle>
      {/* BottomSheet */}
      <DialogHandle>
        {({ show, hide, dialog }) => (
          <BottomSheetDialog dialog={dialog} />
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
  return (
    <Dialog dialog={dialog}>
       ...
    </Dialog>
  );
};

const NoParamsDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);
  return (
    <Dialog dialog={dialog}>
       ...
    </Dialog>
  );
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
