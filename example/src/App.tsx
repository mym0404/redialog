import { View, Button } from 'react-native';
import { Dialog, useDialog, type DialogProps, useDialogProps } from 'redialog';

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
      }}
    >
      <Button
        title={'Show'}
        onPress={() => {
          showParamsDialog({ data: 1 });
        }}
      />
      <Button
        title={'Hide'}
        onPress={() => {
          hideParamsDialog();
        }}
      />
      <Button
        title={'Show'}
        onPress={() => {
          showNoParamsDialog();
        }}
      />
      <Button
        title={'Hide'}
        onPress={() => {
          hideNoParamsDialog();
        }}
      />
      <ParamsDialog dialog={paramsDialog} />
      <NoParamsDialog dialog={noParamsDialog} />
    </View>
  );
}

type ParamsDialogParams = {
  data: number;
};

const ParamsDialog = (props: DialogProps<ParamsDialogParams>) => {
  const [dialog, { show }] = useDialogProps(props);
  show({ data: 1 });
  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#444' }} />
    </Dialog>
  );
};

const NoParamsDialog = (props: DialogProps) => {
  const [dialog, { show }] = useDialogProps(props);
  show();

  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#444' }} />
    </Dialog>
  );
};
