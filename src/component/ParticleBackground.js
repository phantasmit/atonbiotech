/**
 * ParticleBackground.js
 * --------------------------------------------------------------------------
 * Plain JavaScript version (no TypeScript) of the animated particle
 * background for React Native (Expo & bare RN). Works on Android, iOS,
 * tablets, and iPad — auto-scales particle count to the device screen.
 *
 * Usage:
 *   <ParticleBackground>
 *     <YourScreenContent />
 *   </ParticleBackground>
 *
 * Requires: @shopify/react-native-skia
 *   Expo:      npx expo install @shopify/react-native-skia
 *   Bare RN:   npm install @shopify/react-native-skia
 *              cd ios && pod install
 * --------------------------------------------------------------------------
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
  } from 'react';
  import { StyleSheet, View, useColorScheme, useWindowDimensions } from 'react-native';
  import {
    Canvas,
    Circle,
    Line,
    Group,
    vec,
  } from '@shopify/react-native-skia';
  
  // ---------------------------------------------------------------------------
  // Defaults / helpers
  // ---------------------------------------------------------------------------
  
  const DEFAULT_COLORS = [
    'rgba(74, 126, 199, 0.35)', // Blue
    'rgba(91, 173, 78, 0.35)', // Green
    'rgba(201, 196, 58, 0.4)', // Yellow
    'rgba(166, 125, 184, 0.35)', // Purple
  ];
  
  function pickColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  function makeParticle(width, height, colors, isBurst = false, x, y) {
    return {
      x: x !== undefined ? x : Math.random() * width,
      y: y !== undefined ? y : Math.random() * height,
      vx: (Math.random() - 0.5) * (isBurst ? 2.5 : 0.45),
      vy: (Math.random() - 0.5) * (isBurst ? 2.5 : 0.45),
      radius: isBurst ? Math.random() * 3 + 1.5 : Math.random() * 4 + 2,
      color: pickColor(colors),
      isBurst,
      alpha: 1,
    };
  }
  
  /** Scale particle count sensibly across phone / tablet / iPad screen sizes. */
  function computeParticleCount(width, height) {
    const area = width * height;
    // Roughly one particle per ~18,000 px^2, clamped to a sane range.
    const scaled = Math.round(area / 18000);
    return Math.max(24, Math.min(scaled, 140));
  }
  
  function withAlpha(rgba, alpha) {
    return rgba.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`);
  }
  
  // ---------------------------------------------------------------------------
  // Component
  // ---------------------------------------------------------------------------
  
  export default function ParticleBackground({
    children,
    particleCount,
    connectionDistance = 120,
    colors = DEFAULT_COLORS,
    isDark,
    disableTouchBurst = false,
    burstCount = 10,
    backgroundColor,
    style,
  }) {
    const { width, height } = useWindowDimensions();
    const systemScheme = useColorScheme();
    const dark = isDark !== undefined ? isDark : systemScheme === 'dark';
  
    const resolvedCount = particleCount ?? computeParticleCount(width, height);
  
    // Mutable particle store — avoids re-creating arrays every render.
    const particlesRef = useRef([]);
    const dimsRef = useRef({ width, height });
    const [, forceRender] = useReducer((c) => c + 1, 0);
  
    // (Re)seed particles when the base (non-burst) count or screen changes.
    useEffect(() => {
      dimsRef.current = { width, height };
      particlesRef.current = Array.from({ length: resolvedCount }, () =>
        makeParticle(width, height, colors),
      );
    }, [width, height, resolvedCount, colors]);
  
    // Animation loop
    useEffect(() => {
      let raf;
  
      const tick = () => {
        const { width: w, height: h } = dimsRef.current;
        const particles = particlesRef.current;
  
        // Update
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
  
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
  
          if (p.isBurst) {
            p.alpha -= 0.02;
            if (p.alpha <= 0) {
              particles.splice(i, 1);
            }
          }
        }
  
        forceRender();
        raf = requestAnimationFrame(tick);
      };
  
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, []);
  
    // Tap → burst.
    // Uses React Native's own touch responder system instead of Skia's touch
    // API — this keeps it working across different @shopify/react-native-skia
    // versions, since the Skia touch hooks have changed name/shape between
    // releases (this is what caused `useTouchHandler` to be undefined).
    const handleTouch = useCallback(
      (x, y) => {
        if (disableTouchBurst) return;
        const { width: w, height: h } = dimsRef.current;
        for (let i = 0; i < burstCount; i++) {
          particlesRef.current.push(makeParticle(w, h, colors, true, x, y));
        }
      },
      [disableTouchBurst, burstCount, colors],
    );
  
    const onStartShouldSetResponder = useCallback(() => true, []);
  
    const onResponderGrant = useCallback(
      (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTouch(locationX, locationY);
      },
      [handleTouch],
    );
  
    // Precompute connecting lines for this frame (O(n^2), fine up to ~140 pts)
    const lines = useMemo(() => {
      const particles = particlesRef.current;
      const segments = [];
  
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.isBurst && a.alpha < 0.4) continue;
  
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (b.isBurst && b.alpha < 0.4) continue;
  
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
  
          if (dist < connectionDistance) {
            const factor =
              (1 - dist / connectionDistance) * (a.isBurst ? a.alpha : 1);
            const base = dark ? 'rgba(255,255,255,' : 'rgba(74,126,199,';
            const opacity = dark ? 0.08 * factor : 0.12 * factor;
            segments.push({
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              color: `${base}${opacity.toFixed(3)})`,
            });
          }
        }
      }
      return segments;
      // Re-derive every render tick (particlesRef mutates in place).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connectionDistance, dark, particlesRef.current]);
  
    const bg = backgroundColor ?? (dark ? '#111827' : '#f5f7fa');
  
    return (
      <View
        style={[styles.container, { backgroundColor: bg }, style]}
        onStartShouldSetResponder={onStartShouldSetResponder}
        onResponderGrant={onResponderGrant}
      >
        <Canvas style={StyleSheet.absoluteFill}>
          <Group>
            {lines.map((l, idx) => (
              <Line
                key={`line-${idx}`}
                p1={vec(l.x1, l.y1)}
                p2={vec(l.x2, l.y2)}
                color={l.color}
                strokeWidth={0.8}
              />
            ))}
            {particlesRef.current.map((p, idx) => (
              <Circle
                key={`p-${idx}`}
                cx={p.x}
                cy={p.y}
                r={p.radius}
                color={p.isBurst ? withAlpha(p.color, p.alpha * 0.7) : p.color}
              />
            ))}
          </Group>
        </Canvas>
  
        {/* Foreground content sits above the canvas */}
        <View style={styles.content} pointerEvents="box-none">
          {children}
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    content: {
      flex: 1,
    },
  });