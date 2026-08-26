import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * ParticlesBackground
 *
 * Full-screen animated particle canvas rendered via WebView,
 * positioned absolutely so other content can render on top of it.
 *
 * Usage:
 * <View style={{ flex: 1 }}>
 *   <ParticlesBackground />
 *   <View style={{ flex: 1 }}>
 *     ...your actual screen content on top...
 *   </View>
 * </View>
 */
export default function ParticlesBackground({ theme = 'light', style, onReady }) {
  const html = `
<!DOCTYPE html>
<html lang="en" data-bs-theme="${theme}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            overflow: hidden;
        }
        #particles-canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
    <script>
        (function() {
            const canvas = document.createElement('canvas');
            canvas.id = 'particles-canvas';
            document.body.insertBefore(canvas, document.body.firstChild);

            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            const particles = [];
            const particleCount = 45;
            const colors = [
                'rgba(74, 126, 199, 0.35)',
                'rgba(91, 173, 78, 0.35)',
                'rgba(201, 196, 58, 0.4)',
                'rgba(166, 125, 184, 0.35)'
            ];

            class Particle {
                constructor(x, y, isBurst = false) {
                    this.x = x !== undefined ? x : Math.random() * width;
                    this.y = y !== undefined ? y : Math.random() * height;
                    this.radius = isBurst ? (Math.random() * 3 + 1.5) : (Math.random() * 4 + 2);
                    this.vx = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.45);
                    this.vy = (Math.random() - 0.5) * (isBurst ? 2.5 : 0.45);
                    this.color = colors[Math.floor(Math.random() * colors.length)];
                    this.isBurst = isBurst;
                    this.alpha = 1;
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;

                    if (this.isBurst) {
                        this.alpha -= 0.02;
                    }
                }

                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    let c = this.color;
                    if (this.isBurst) {
                        c = c.replace(/[\\d\\.]+\\)$/, (this.alpha * 0.7) + ')');
                    }
                    ctx.fillStyle = c;
                    ctx.fill();
                }
            }

            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }

            function animate() {
                ctx.clearRect(0, 0, width, height);

                for (let i = particles.length - 1; i >= 0; i--) {
                    if (particles[i].isBurst && particles[i].alpha <= 0) {
                        particles.splice(i, 1);
                    }
                }

                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();

                    for (let j = i + 1; j < particles.length; j++) {
                        if (particles[i].isBurst && particles[i].alpha < 0.4) continue;
                        if (particles[j].isBurst && particles[j].alpha < 0.4) continue;

                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 120) {
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            const factor = (1 - dist / 120) * (particles[i].isBurst ? particles[i].alpha : 1);
                            ctx.strokeStyle = document.documentElement.getAttribute('data-bs-theme') === 'dark'
                                ? 'rgba(255, 255, 255, ' + (0.08 * factor) + ')'
                                : 'rgba(74, 126, 199, ' + (0.12 * factor) + ')';
                            ctx.lineWidth = 0.8;
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }

            window.addEventListener('click', (e) => {
                const burstCount = 10;
                for (let i = 0; i < burstCount; i++) {
                    particles.push(new Particle(e.clientX, e.clientY, true));
                }
            });

            window.addEventListener('resize', () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            });

            animate();
        })();
    </script>
</body>
</html>
`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={[styles.webview, style]}
      containerStyle={styles.webview}
      scrollEnabled={false}
      bounces={false}
      pointerEvents="none"
      backgroundColor="transparent"
      androidLayerType="hardware"
      onLoadEnd={() => onReady && onReady()}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
