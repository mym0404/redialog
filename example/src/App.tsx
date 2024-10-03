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
