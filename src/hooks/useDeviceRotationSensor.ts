import { useLayoutEffect, useRef } from 'react';

import { Platform } from 'react-native';
import { gravity } from 'react-native-sensors';

export type Orientation = 'top' | 'down' | 'right' | 'left';

// Build in hysteresis using orientationTriggerAngle offset from 45 rotations.
const orientationTriggerAngle = 10;

// When the device is laying down (this angle off of a flat surface) orientation will not change.
const flatDeadZoneAngle = 60;

export const useDeviceRotationSensor = (
  callback: (orientation: Orientation, rotation: number) => void,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useLayoutEffect(() => {
    // We use gravity sensor here because react-native-orientation
    // can't detect landscape orientation when the device's orientation is locked.
    let orientation: Orientation = 'top';

    // This simple stack is used to ensure we don't report an orientation value for only one pass. This prevents
    // the caller from applying a UI update for one frame resulting in a visual artifact.
    const orientationStack: Orientation[] = ['top', 'top'];

    const subscription = gravity.subscribe(({ x, y, z }) => {
      // https://community.khronos.org/t/converting-a-3d-vector-into-three-euler-angles/49889/4
      // https://www.oreilly.com/library/view/beginning-ios-5/9781118144251/ch015-sec001.html

      // Rotation left/right around z axis
      // -180..0..180
      // 0 device rotated 90 clockwise, negative counter-clockwise, positive clockwise
      const radian = Math.atan2(y, x);
      const rotation = (radian * 180) / Math.PI;

      // Rotation (tilt forward/backward) around x axis
      // -90..0..90
      // 0 device straight up, positive back, negative forward
      const r = Math.sqrt(x * x + y * y + z * z);
      const tiltForwardBackward = (Math.acos(z / r) * 180.0) / Math.PI - 90.0;

      // Rotation (pan left/right) around y axis
      // -180..0..180
      // -90 device flat face up, rotate right/away positive, rotate left/toward negative
      const radianY = Math.atan2(z, x);
      const panLeftRight = (radianY * 180) / Math.PI;

      // Whether or not the device is laying down (e.g. on a table).
      const flat = Math.abs(tiltForwardBackward) > flatDeadZoneAngle;

      if (Platform.OS === 'ios') {
        if (!flat) {
          switch (orientation) {
            case 'top':
              if (rotation < 0 && rotation > -45 + orientationTriggerAngle)
                orientation = 'right';
              if (rotation < 0 && rotation < -135 - orientationTriggerAngle)
                orientation = 'left';
              if (rotation > 0 && tiltForwardBackward < 60)
                orientation = 'down';

              break;
            case 'down':
              if (rotation > 0 && rotation > 135 + orientationTriggerAngle)
                orientation = 'left';
              if (rotation > 0 && rotation < 45 - orientationTriggerAngle)
                orientation = 'right';
              if (rotation < 0 && tiltForwardBackward < 60) orientation = 'top';
              break;
            case 'left':
              if (rotation > 0 && rotation < 135 - orientationTriggerAngle)
                orientation = 'down';
              if (rotation < 0 && rotation > -135 + orientationTriggerAngle)
                orientation = 'top';
              if (panLeftRight > -60) orientation = 'right';
              break;
            case 'right':
              if (rotation > 0 && rotation > 45 + orientationTriggerAngle)
                orientation = 'down';
              if (rotation < 0 && rotation < -45 - orientationTriggerAngle)
                orientation = 'top';
              // if (panLeftRight > -120) orientation = 'left'; // Not needed as orientation will pass through top/down resulting in the flip
              break;
          }
        }
      }

      if (Platform.OS === 'android') {
        if (!flat) {
          switch (orientation) {
            case 'top':
              if (rotation > 0 && rotation > 135 + orientationTriggerAngle)
                orientation = 'right';
              if (rotation > 0 && rotation < 45 - orientationTriggerAngle)
                orientation = 'left';
              if (rotation < 0 && tiltForwardBackward < 60)
                orientation = 'down';
              break;
            case 'down':
              if (rotation < 0 && rotation > -45 + orientationTriggerAngle)
                orientation = 'left';
              if (rotation < 0 && rotation < -135 - orientationTriggerAngle)
                orientation = 'right';
              if (rotation > 0 && tiltForwardBackward < 60) orientation = 'top';
              break;
            case 'left':
              if (rotation > 0 && rotation > 45 + orientationTriggerAngle)
                orientation = 'top';
              if (rotation < 0 && rotation < -45 - orientationTriggerAngle)
                orientation = 'down';
              if (panLeftRight > 120) orientation = 'right';
              break;
            case 'right':
              if (rotation > 0 && rotation < 135 - orientationTriggerAngle)
                orientation = 'top';
              if (rotation < 0 && rotation > -135 + orientationTriggerAngle)
                orientation = 'down';
              // if (panLeftRight < 60) orientation = 'left'; // Not needed as orientation will pass through top/down resulting in the flip
              break;
          }
        }
      }

      // Update the stack amd ensure both values are the same before reporting the orientation.
      orientationStack.push(orientation);
      orientationStack.shift();

      if (orientationStack[0] === orientationStack[1]) {
        callbackRef.current(orientation, rotation);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
};
