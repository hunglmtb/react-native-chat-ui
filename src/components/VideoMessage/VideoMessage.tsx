import * as React from 'react';

import {
  FocusedMessageContext,
  ThemeContext,
  UrlResolverContext,
} from '../../utils';
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

  const [resolvedPosterUri, setResolvedPosterUri] = React.useState<string>('');
  const [resolvedVideoUri, setResolvedVideoUri] = React.useState<string>('');
  const resolveUrl = React.useContext(UrlResolverContext);

  React.useEffect(() => {
    resolveUrl(message.posterUri || '', setResolvedPosterUri);
    resolveUrl(message.uri, setResolvedVideoUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    // Remove the status bar when the video modal is shown.
    StatusBar.setHidden(isFocused);
  }, [isFocused]);

  return (
    <>
      <View style={videoPosterContainer}>
        {resolvedPosterUri && (
          <Image
            accessibilityRole="image"
            style={poster}
            source={{ uri: resolvedPosterUri }}
            resizeMode={'contain'}
          />
        )}
        <View style={overlayContainer}>
          <Image
            source={require('../../assets/icon-play.png')}
            style={overlayImage}
          />
        </View>
      </View>
      {isFocused && (
        <Modal
          animationType={'fade'}
          statusBarTranslucent={true}
          hardwareAccelerated={true}>
          <View style={[StyleSheet.absoluteFill, videoContainer]}>
            {resolvedVideoUri && (
              <Video
                mimeType={message.mimeType}
                uri={resolvedVideoUri}
                paused={false}
                onClose={() =>
                  setFocusedMessage && setFocusedMessage(undefined)
                }
                onError={() =>
                  setFocusedMessage && setFocusedMessage(undefined)
                }
              />
            )}
          </View>
        </Modal>
      )}
    </>
  );
};
