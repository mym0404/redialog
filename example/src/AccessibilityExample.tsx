import { useRef } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  type HostInstance,
} from 'react-native';
import { Dialog, PortalHost, useDialog } from 'redialog';

const MAIN_HOST = 'accessibility-main';
const SIBLING_HOST = 'accessibility-sibling';
const NESTED_HOST = 'accessibility-nested';

export function AccessibilityExample({ onBack }: { onBack: () => void }) {
  const [first, firstControls] = useDialog();
  const [second, secondControls] = useDialog();
  const [nested, nestedControls] = useDialog();
  const openerRef = useRef<HostInstance>(null);
  const firstTitleRef = useRef<HostInstance>(null);
  const secondTitleRef = useRef<HostInstance>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <PortalHost hostId={MAIN_HOST}>
        <View style={styles.section}>
          <Text accessibilityRole="header">Main host content</Text>
          <Pressable
            ref={openerRef}
            accessibilityRole="button"
            onPress={firstControls.show}
            style={styles.button}
          >
            <Text>Open main dialog</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.button}
          >
            <Text>Back to examples</Text>
          </Pressable>
          <View style={styles.nested}>
            <PortalHost hostId={NESTED_HOST}>
              <Pressable
                accessibilityRole="button"
                onPress={nestedControls.show}
                style={styles.button}
              >
                <Text>Open nested dialog</Text>
              </Pressable>
              <Dialog
                dialog={{ dialog: nested }}
                portal
                accessibilityLabel="Nested dialog"
                style={styles.card}
              >
                <Text>Nested dialog content</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={firstControls.show}
                  style={styles.button}
                >
                  <Text>Open main over nested</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={nestedControls.hide}
                  style={styles.button}
                >
                  <Text>Close nested dialog</Text>
                </Pressable>
              </Dialog>
            </PortalHost>
          </View>
        </View>
        <Dialog
          dialog={{ dialog: first }}
          portal
          accessibilityLabel="Main dialog"
          backdropAccessibilityLabel="Dismiss main dialog"
          initialFocusRef={firstTitleRef}
          returnFocusRef={openerRef}
          style={styles.card}
        >
          <Text ref={firstTitleRef} accessible accessibilityRole="header">
            Main dialog title
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={secondControls.show}
            style={styles.button}
          >
            <Text>Open second dialog</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={firstControls.hide}
            style={styles.button}
          >
            <Text>Close main dialog</Text>
          </Pressable>
        </Dialog>
      </PortalHost>
      <PortalHost hostId={SIBLING_HOST}>
        <View style={styles.section}>
          <Text accessibilityRole="header">Sibling host content</Text>
          <Pressable
            accessibilityRole="button"
            onPress={secondControls.show}
            style={styles.button}
          >
            <Text>Open sibling dialog</Text>
          </Pressable>
        </View>
        <Dialog
          dialog={{ dialog: second }}
          portal
          accessibilityLabel="Second dialog"
          initialFocusRef={secondTitleRef}
          style={styles.card}
        >
          <Text ref={secondTitleRef} accessible accessibilityRole="header">
            Second dialog title
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={secondControls.hide}
            style={styles.button}
          >
            <Text>Close second dialog</Text>
          </Pressable>
        </Dialog>
      </PortalHost>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingVertical: 40, backgroundColor: '#f5f5f5' },
  section: { flex: 1, padding: 16, gap: 12 },
  button: { padding: 14, backgroundColor: '#dceaff', borderRadius: 8 },
  nested: { height: 220, borderWidth: 1, borderColor: '#777' },
  card: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    gap: 16,
    minWidth: 270,
  },
});
