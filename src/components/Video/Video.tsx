import * as React from 'react';

import { ActivityIndicator, Alert, View, ViewStyle } from 'react-native';

import RNVideo from 'react-native-video';
import { ThemeContext } from '../../utils';
import styles from './styles';

enum VideoStatus {
  None,
  Loading,
  Loaded,
}

export interface VideoProps {
  containerStyle?: ViewStyle | ViewStyle[];
  mimeType: string;
  onEnd?: () => void;
  onError?: () => void;
  onFullscreenClose?: () => void;
  onFullscreenOpen?: () => void;
  paused?: boolean;
  uri: string;
  videoStyle?: ViewStyle | ViewStyle[];
}

export const Video = ({
  containerStyle,
  mimeType,
  onEnd,
  onError,
  onFullscreenClose,
  onFullscreenOpen,
  paused = true,
  uri,
  videoStyle,
}: VideoProps) => {
  const theme = React.useContext(ThemeContext);

  const { spinner, video, videoContainer } = styles({ theme });
  const [status, setStatus] = React.useState(VideoStatus.None);
  const isLoading = status === VideoStatus.Loading;

  const onVideoError = () => {
    setStatus(VideoStatus.None);
    onError && onError();
    Alert.alert(
      'Video Playback Error',
      'This video could not be loaded or failed to play. Please try again.',
      [{ text: 'OK' }],
      { cancelable: false },
    );
  };

  return (
    <View style={[videoContainer, containerStyle]}>
      <RNVideo
        style={[video, videoStyle]}
        source={{ uri, type: mimeType }}
        controls
        paused={paused}
        resizeMode={'contain'}
        onError={onVideoError}
        onFullscreenPlayerDidDismiss={() => setStatus(VideoStatus.None)}
        onLoadStart={() => setStatus(VideoStatus.Loading)}
        onLoad={() => setStatus(VideoStatus.Loaded)}
        onEnd={onEnd}
        onFullscreenPlayerDidPresent={onFullscreenOpen}
        onFullscreenPlayerWillDismiss={onFullscreenClose}
      />
      {isLoading && (
        <View style={spinner}>
          <ActivityIndicator color={theme.colors?.secondary} />
        </View>
      )}
    </View>
  );
};
