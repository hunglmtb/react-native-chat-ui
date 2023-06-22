import * as React from 'react';

import { Alert, ViewStyle } from 'react-native';
import Animated, {
  AnimatedStyleProp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import VideoPlayer from 'react-native-media-console';
import styles from './styles';
import { useDeviceRotationSensor } from '../../hooks/useDeviceRotationSensor';
import { useState } from 'react';

export interface VideoProps {
  mimeType: string;
  onClose?: () => void;
  onError?: () => void;
  paused?: boolean;
  uri: string;
}

export const Video = ({
  mimeType,
  onClose,
  onError,
  paused = true,
  uri,
}: VideoProps) => {
  const { landscapeLeft, landscapeRight, portraitDown, portraitUp } = styles();

  const [orientation, setOrientation] = useState('up');
  const rotation = useSharedValue(0);

  const animatedRotation = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    } as AnimatedStyleProp<ViewStyle>;
  });

  useDeviceRotationSensor(newOrientation => {
    if (newOrientation !== orientation) {
      setOrientation(newOrientation);
      switch (newOrientation) {
        case 'down':
          rotation.value = withTiming(rotation.value < 0 ? -180 : 180);
          break;
        case 'left':
          rotation.value = withTiming(90);
          break;
        case 'right':
          rotation.value = withTiming(-90);
          break;
        case 'top':
          rotation.value = withTiming(0);
          break;
      }
    }
  });

  const onVideoError = () => {
    onError && onError();
    Alert.alert(
      'Video Playback Error',
      'This video could not be loaded or failed to play. Please try again.',
      [{ text: 'OK' }],
      { cancelable: false },
    );
  };

  return (
    <Animated.View style={animatedRotation}>
      <VideoPlayer
        containerStyle={[
          orientation === 'left'
            ? landscapeLeft
            : orientation === 'right'
            ? landscapeRight
            : orientation === 'down'
            ? portraitDown
            : portraitUp,
        ]}
        disableSeekButtons={true}
        disableFullscreen={true}
        paused={paused}
        source={{ uri, type: mimeType }}
        showOnStart={true}
        controlAnimationTiming={300}
        showOnEnd={true}
        onBack={onClose}
        onError={onVideoError}
      />
    </Animated.View>
  );
};
