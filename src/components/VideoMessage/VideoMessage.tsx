import * as React from 'react';

import { Image, View } from 'react-native';
import { ThemeContext, UrlResolverContext } from '../../utils';

import { MessageType } from '../../types';
import styles from './styles';

export interface VideoMessageProps {
  isFocused: boolean;
  message: MessageType.DerivedVideo;
}

export const VideoMessage = ({ message }: VideoMessageProps) => {
  const theme = React.useContext(ThemeContext);

  const { overlayContainer, overlayImage, poster, videoPosterContainer } =
    styles({
      message,
      theme,
    });

  const [resolvedPosterUri, setResolvedPosterUri] = React.useState<string>();
  const resolveUrl = React.useContext(UrlResolverContext);

  React.useEffect(() => {
    resolveUrl(message.posterUri || '', setResolvedPosterUri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
  );
};
