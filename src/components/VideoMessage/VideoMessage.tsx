import * as React from 'react';

import { FocusedMessageContext, ThemeContext, UserContext } from '../../utils';
import { Image, Modal, StatusBar, StyleSheet, View } from 'react-native';
import { MessageType, Size } from '../../types';

import { Video } from '../Video';
import styles from './styles';

export interface VideoMessageProps {
  isFocused: boolean;
  message: MessageType.DerivedVideo;
  /** Maximum message width */
  messageWidth: number;
}

export const VideoMessage = ({
  isFocused,
  message,
  messageWidth,
}: VideoMessageProps) => {
  const setFocusedMessage = React.useContext(FocusedMessageContext);
  const theme = React.useContext(ThemeContext);
  const user = React.useContext(UserContext);

  const defaultHeight = message.height ?? 0;
  const defaultWidth = message.width ?? 0;
  const [size, setSize] = React.useState<Size>({
    height: defaultHeight,
    width: defaultWidth,
  });
  const aspectRatio = size.width / (size.height || 1);
  const {
    overlayContainer,
    overlayImage,
    poster,
    videoContainer,
    videoPosterContainer,
  } = styles({
    aspectRatio,
    message,
    messageWidth,
    theme,
    user,
  });

  React.useEffect(() => {
    if (defaultHeight <= 0 || defaultWidth <= 0)
      Image.getSize(
        message.uri,
        (width, height) => setSize({ height, width }),
        () => setSize({ height: 0, width: 0 }),
      );
  }, [defaultHeight, defaultWidth, message.uri]);

  React.useEffect(() => {
    // Remove the status bar when the video modal is shown.
    StatusBar.setHidden(isFocused);
  }, [isFocused]);

  return (
    <>
      {!isFocused ? (
        <View style={videoPosterContainer}>
          <Image
            accessibilityRole="image"
            style={poster}
            source={{ uri: message.posterUri }}
            resizeMode={'contain'}
          />
          <View style={overlayContainer}>
            <Image
              source={require('../../assets/icon-play.png')}
              style={overlayImage}
            />
          </View>
        </View>
      ) : (
        <Modal
          animationType={'fade'}
          statusBarTranslucent={true}
          hardwareAccelerated={true}>
          <View style={[StyleSheet.absoluteFill, videoContainer]}>
            <Video
              mimeType={message.mimeType}
              uri={message.uri}
              paused={false}
              onClose={() => setFocusedMessage && setFocusedMessage(undefined)}
              onError={() => setFocusedMessage && setFocusedMessage(undefined)}
            />
          </View>
        </Modal>
      )}
    </>
  );
};
