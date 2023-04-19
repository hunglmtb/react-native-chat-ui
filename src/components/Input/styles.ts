import { StyleSheet } from 'react-native';
import { Theme } from '../../types';

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    input: {
      flex: 1,
      maxHeight: 100,
      minHeight: 25,
      paddingHorizontal: 10,
      // Fixes default paddings for Android
      paddingBottom: 0,
      paddingTop: 0,
      ...theme.composer?.inputStyle,
    },
    marginRight: {
      marginRight: 24,
    },
  });
