import * as React from 'react';

import { FocusedMessageContext, ThemeContext } from '../../utils';
import { Image, Modal, StatusBar, StyleSheet, View } from 'react-native';

import { MessageType } from '../../types';
import { Video } from '../Video';
import styles from './styles';

export interface VideoMessageProps {
  isFocused: boolean;
  message: MessageType.DerivedVideo;
}

export const VideoMessage = ({ isFocused, message }: VideoMessageProps) => {
  const setFocusedMessage = React.useContext(FocusedMessageContext);
  const theme = React.useContext(ThemeContext);

  const {
    overlayContainer,
    overlayImage,
    poster,
    videoContainer,
    videoPosterContainer,
  } = styles({
    message,
    theme,
  });

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
