uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPulseSpeed;
uniform sampler2D uNoiseTexture;

varying vec3 vWorldPos;
varying vec2 vUv;

#include ../includes/snoise.glsl

void main() {
  // Create pulsing effect
  float pulse = sin(uTime * uPulseSpeed) * 0.5 + 0.5;

  // Add noise for organic movement
  vec3 noisePos = vWorldPos * 2.0 + uTime * 0.5;
  float noise = snoise(noisePos) * 0.5 + 0.5;

  // Combine effects
  float alpha = pulse * noise * uIntensity;

  // Create color gradient
  vec3 color = mix(uColor, uColor * 1.5, pulse);

  csm_FragColor = vec4(color, alpha);
   #include <colorspace_fragment>
}
