import { View, Button } from 'react-native';
import { Dialog, useDialog, type DialogProps, useDialogProps } from 'redialog';

export default function App() {
  const [dialog, { show, hide }] = useDialog<typeof ExampleDialog>();

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
          show({ data: 1 });
        }}
      />
      <Button
        title={'Hide'}
        onPress={() => {
          hide();
        }}
      />
      <ExampleDialog dialog={dialog} />
    </View>
  );
}

type ExampleDialogParams = {
  data: number;
};

const ExampleDialog = (props: DialogProps<ExampleDialogParams>) => {
  const [dialog] = useDialogProps(props);

  return (
    <Dialog dialog={dialog}>
      <View style={{ padding: 100, backgroundColor: '#444' }} />
    </Dialog>
  );
};
