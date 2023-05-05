import { StyleSheet } from 'react-native';
import { Theme } from '../../types';

export default ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    attachmentContainer: {
      height: 150,
      aspectRatio: 1,
      marginRight: 5,
      borderRadius: 15,
    },
    container: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    input: {
      maxHeight: 100,
      minHeight: 25,
      paddingHorizontal: 10,
      // Fixes default paddings for Android
      paddingBottom: 0,
      paddingTop: 0,
      ...theme.composer?.inputStyle,
    },
    inputAttachmentDivider: {
      borderRadius: 0,
      ...theme.composer?.inputAttachmentDivider,
    },
    inputContainer: {
      flex: 1,
      overflow: 'hidden',
      ...theme.composer?.inputContainer,
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
