import { View, Button } from 'react-native';
import { Dialog, useDialog, type DialogProps, useDialogProps } from 'redialog';
import { DialogHandle } from '../../src/component/DialogHandle';

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
        backgroundColor: '#111',
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
      <View style={{ padding: 100, backgroundColor: '#444' }} />
    </Dialog>
  );
};

const NoParamsDialog = (props: DialogProps) => {
  const [dialog] = useDialogProps(props);

  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#444' }} />
    </Dialog>
  );
};
