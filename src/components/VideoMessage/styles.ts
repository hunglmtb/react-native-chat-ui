import { MessageType, Theme, User } from '../../types';

import { StyleSheet } from 'react-native';

const styles = ({
  aspectRatio,
  message,
  messageWidth,
  theme,
  user,
}: {
  aspectRatio: number;
  message: MessageType.Video;
  messageWidth: number;
  theme: Theme;
  user?: User;
}) => {
  const restTextContainer =
    user?.id === message.author.id
      ? theme.bubble?.textRightContainer
      : theme.bubble?.textLeftContainer;

  return StyleSheet.create({
    horizontalImage: {
      height: messageWidth / aspectRatio,
      maxHeight: messageWidth,
      width: messageWidth,
    },
    minimizedImage: {
      borderRadius: 15,
      height: 64,
      marginLeft: restTextContainer?.marginLeft,
      marginRight: 16,
      marginVertical: restTextContainer?.marginVertical,
      width: 64,
    },
    minimizedImageContainer: {
      alignItems: 'center',
      backgroundColor:
        user?.id === message.author.id
          ? theme.colors?.primary
          : theme.colors?.secondary,
      flexDirection: 'row',
    },
    nameText: {
      ...(user?.id === message.author.id
        ? theme.bubble?.bodyTextRight
        : theme.bubble?.bodyTextLeft),
    },
    sizeText: {
      ...(user?.id === message.author.id
        ? theme.bubble?.captionTextRight
        : theme.bubble?.captionTextLeft),
    },
    textContainer: {
      flexShrink: 1,
      ...restTextContainer,
    },
    verticalImage: {
      height: messageWidth,
      minWidth: 170,
      width: messageWidth * aspectRatio,
    },
    overlayContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    overlayImage: {
      width: 50,
      height: 50,
    },
    poster: {
      width: '100%',
      height: '100%',
      backgroundColor:
        theme.bubble?.contentRightContainer?.backgroundColor ||
        theme.colors?.primary,
    },
    videoContainer: {
      width: 250,
      height: 150,
      maxWidth: '100%',
      alignSelf: 'center',
      aspectRatio:
        message.width && message.height
          ? message.width / message.height
          : undefined,
    },
  });
};
export default styles;
