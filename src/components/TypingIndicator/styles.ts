import { StyleSheet } from 'react-native';
import { Theme } from '../../types';

const styles = ({ theme }: { theme: Theme }) =>
  StyleSheet.create({
    bubbleContainer: {
      overflow: 'hidden',
      height: 35,
      width: 58,
      paddingLeft: 12,
      paddingTop: 8,
      borderRadius: theme.bubble?.contentLeftContainer?.borderRadius,
      borderBottomLeftRadius: 0,
      backgroundColor: theme.bubble?.contentLeftContainer?.backgroundColor,
      ...theme.bubble?.contentLeftContainer,
    },
    container: {},
    namesText: {
      marginLeft: 8,
      paddingBottom: 5,
      ...theme.bubble?.username,
    },
  });

export default styles;
