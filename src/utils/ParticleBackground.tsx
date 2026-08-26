// import React, { useCallback, useState } from 'react';
// import {
//   LayoutChangeEvent,
//   StyleSheet,
//   View,
// } from 'react-native';

// import {
//   Canvas,
//   Circle,
// } from '@shopify/react-native-skia';

// import {
//   useFrameCallback,
//   useSharedValue,
// } from 'react-native-reanimated';

// const PARTICLE_COUNT = 45;

// type Particle = {
//   x: number;
//   y: number;
//   vx: number;
//   vy: number;
//   radius: number;
// };

// const random = (min: number, max: number) =>
//   Math.random() * (max - min) + min;

// export default function ParticleBackground() {
//   const [layout, setLayout] = useState({
//     width: 0,
//     height: 0,
//   });

//   const particles = useSharedValue<Particle[]>([]);

//   const handleLayout = useCallback(
//     (event: LayoutChangeEvent) => {
//       const { width, height } = event.nativeEvent.layout;

//       if (width <= 0 || height <= 0) {
//         return;
//       }

//       const initialParticles: Particle[] = Array.from(
//         { length: PARTICLE_COUNT },
//         () => ({
//           x: Math.random() * width,
//           y: Math.random() * height,
//           vx: random(-0.45, 0.45),
//           vy: random(-0.45, 0.45),
//           radius: random(2, 6),
//         }),
//       );

//       particles.value = initialParticles;

//       setLayout({
//         width,
//         height,
//       });
//     },
//     [],
//   );

//   useFrameCallback((frameInfo) => {
//     'worklet';

//     const delta = frameInfo.timeSincePreviousFrame;

//     if (delta == null) {
//       return;
//     }

//     const multiplier = Math.min(delta / 16.67, 2);

//     const current = particles.value;

//     if (current.length === 0) {
//       return;
//     }

//     const updated = current.map((particle) => {
//       let x = particle.x + particle.vx * multiplier;
//       let y = particle.y + particle.vy * multiplier;

//       let vx = particle.vx;
//       let vy = particle.vy;

//       if (x <= 0 || x >= layout.width) {
//         vx = -vx;
//         x = Math.max(0, Math.min(layout.width, x));
//       }

//       if (y <= 0 || y >= layout.height) {
//         vy = -vy;
//         y = Math.max(0, Math.min(layout.height, y));
//       }

//       return {
//         ...particle,
//         x,
//         y,
//         vx,
//         vy,
//       };
//     });

//     particles.value = updated;
//   });

//   if (layout.width === 0 || layout.height === 0) {
//     return (
//       <View
//         style={styles.container}
//         onLayout={handleLayout}
//       />
//     );
//   }

//   return (
//     <View
//       style={styles.container}
//       onLayout={handleLayout}
//     >
//       <Canvas style={StyleSheet.absoluteFillObject}>
//         {particles.value.map((particle, index) => (
//           <Circle
//             key={index}
//             cx={particle.x}
//             cy={particle.y}
//             r={particle.radius}
//             color="rgba(74,126,199,0.5)"
//           />
//         ))}
//       </Canvas>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     overflow: 'hidden',
//   },
// });