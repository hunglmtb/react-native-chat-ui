import { StyleSheet } from 'react-native';
import { Theme } from '../../types';

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    attachmentContainer: {
      height: 150,
      aspectRatio: 1,
      marginRight: 3,
      borderRadius: 10,
    },
    container: {
      alignItems: 'flex-end',
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
    removeAttachmentButton: {
      position: 'absolute',
      top: 5,
      right: 8,
    },
    removeAttachmentButtonImage: {
      width: 25,
      height: 25,
      tintColor: theme.composer?.removeAttachmentButton?.tintColor,
      backgroundColor: theme.composer?.removeAttachmentButton?.backgroundColor,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.composer?.removeAttachmentButton?.borderColor,
    },
  });
