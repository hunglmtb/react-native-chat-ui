import { StyleSheet } from 'react-native';
import { Theme } from '../../types';

const styles = ({ theme }: { theme: Theme }) => {
  return StyleSheet.create({
    spinner: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      bottom: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    video: {
      width: '100%',
      height: '100%',
      backgroundColor:
        theme.bubble?.contentRightContainer?.backgroundColor ||
        theme.colors?.primary,
    },
    videoContainer: {
      height: 150,
      maxWidth: '100%',
      alignSelf: 'center',
    },
  });
};
export default styles;
