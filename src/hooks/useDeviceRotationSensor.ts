// See https://github.com/mrousavy/react-native-vision-camera/issues/624#issuecomment-1120092461

import { useLayoutEffect, useRef } from 'react';

import { Platform } from 'react-native';
import { gravity } from 'react-native-sensors';

export type Rotation = 'top' | 'down' | 'right' | 'left';

// Build in hysteresis using rotationTriggerAngle offset from 45 degrees
const rotationTriggerAngle = 10;

export const useDeviceRotationSensor = (
  callback: (rotation: Rotation, degree: number) => void,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useLayoutEffect(() => {
    // We use gravity sensor here because react-native-orientation
    // can't detect landscape orientation when the device's orientation is locked
    let rotation: Rotation = 'top';

    const subscription = gravity.subscribe(({ x, y }) => {
      const radian = Math.atan2(y, x);
      const degree = (radian * 180) / Math.PI;
      console.log(rotation, degree);

      if (Platform.OS === 'ios') {
        switch (rotation) {
          case 'top':
            if (degree < 0 && degree > -45 + rotationTriggerAngle)
              rotation = 'right';
            if (degree < 0 && degree < -135 - rotationTriggerAngle)
              rotation = 'left';
            break;
          case 'down':
            if (degree > 0 && degree > 135 + rotationTriggerAngle)
              rotation = 'left';
            if (degree > 0 && degree < 45 - rotationTriggerAngle)
              rotation = 'right';
            break;
          case 'left':
            if (degree > 0 && degree < 135 - rotationTriggerAngle)
              rotation = 'down';
            if (degree < 0 && degree > -135 + rotationTriggerAngle)
              rotation = 'top';
            break;
          case 'right':
            if (degree > 45 + rotationTriggerAngle) rotation = 'down';
            if (degree < -45 - rotationTriggerAngle) rotation = 'top';
            break;
        }
      }

      if (Platform.OS === 'android') {
        switch (rotation) {
          case 'down':
            if (degree < 0 && degree > -45 + rotationTriggerAngle)
              rotation = 'left';
            if (degree < 0 && degree < -135 - rotationTriggerAngle)
              rotation = 'right';
            break;
          case 'top':
            if (degree > 0 && degree > 135 + rotationTriggerAngle)
              rotation = 'right';
            if (degree > 0 && degree < 45 - rotationTriggerAngle)
              rotation = 'left';
            break;
          case 'right':
            if (degree > 0 && degree < 135 - rotationTriggerAngle)
              rotation = 'top';
            if (degree < 0 && degree > -135 + rotationTriggerAngle)
              rotation = 'down';
            break;
          case 'left':
            if (degree > 45 + rotationTriggerAngle) rotation = 'top';
            if (degree < -45 - rotationTriggerAngle) rotation = 'down';
            break;
        }
      }

      callbackRef.current(rotation, degree);
    });
    return () => subscription.unsubscribe();
  }, []);
};
