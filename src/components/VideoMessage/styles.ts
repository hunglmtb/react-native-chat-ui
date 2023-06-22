import { Dimensions, StyleSheet } from 'react-native';
import { MessageType, Theme } from '../../types';

const styles = ({
  message,
  theme,
}: {
  message: MessageType.Video;
  theme: Theme;
}) => {
  return StyleSheet.create({
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
    videoPosterContainer: {
      width: Dimensions.get('screen').width * 0.6,
      aspectRatio:
        message.width && message.height ? message.width / message.height : 1,
    },
  });
};
export default styles;
