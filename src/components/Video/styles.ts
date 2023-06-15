import { Dimensions, Platform, StyleSheet } from 'react-native';

const styles = () => {
  return StyleSheet.create({
    landscapeLeft: {
      width: Dimensions.get('screen').height,
      maxHeight: Dimensions.get('screen').width,
      ...Platform.select({
        ios: {
          paddingHorizontal: 10,
        },
        android: {
          paddingHorizontal: 30,
        },
      }),
    },
    landscapeRight: {
      width: Dimensions.get('screen').height,
      maxHeight: Dimensions.get('screen').width,
      ...Platform.select({
        ios: {
          paddingHorizontal: 10,
        },
        android: {
          paddingHorizontal: 30,
        },
      }),
    },
    portraitDown: {
      width: Dimensions.get('screen').width,
    },
    portraitUp: {
      width: Dimensions.get('screen').width,
    },
  });
};
export default styles;
