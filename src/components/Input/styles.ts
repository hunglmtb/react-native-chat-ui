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
    attachmentButtonIcon: {
      ...theme.composer?.attachmentButtonIcon,
    },
    attachmentIcon: {
      ...theme.composer?.attachmentIcon,
    },
    attachmentIconContainer: {
      alignItems: 'center',
      backgroundColor: theme.colors?.light,
      borderRadius: 21,
      height: 42,
      justifyContent: 'center',
      width: 42,
      alignSelf: 'center',
    },
    container: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    emojiText: {
      fontSize: 50,
      lineHeight: 58,
    },
    fileAttachmentContainer: {
      borderWidth: 1,
      justifyContent: 'center',
      padding: 10,
      aspectRatio: 0.8,
      ...theme.composer?.fileAttachmentContainer,
    },
    fileAttachmentIconContainer: {
      ...theme.composer?.fileAttachmentIconContainer,
    },
    fileAttachmentName: {
      textAlign: 'center',
      marginTop: 5,
      ...theme.composer?.fileAttachmentText,
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
    attachmentOverlayVideo: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    attachmentOverlayVideoImage: {
      bottom: 5,
      left: 8,
    },
    attachmentOverlayVideoDuration: {
      right: 12,
      ...theme.composer?.videoAttachmentDurationText,
    },
  });
