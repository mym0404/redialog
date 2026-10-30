import { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';

export function useBackPress(condition: boolean, callback: () => void) {
  useEffect(() => {
    if (condition && Platform.OS === 'android') {
      return BackHandler.addEventListener('hardwareBackPress', () => {
        callback();
        return true;
      }).remove;
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);
}
