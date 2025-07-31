uniform sampler2D uWaterNoiseTexture;
uniform float uTime;

varying vec2 vUv;

#include ../includes/cnoise.glsl

void main() {
  float waterSurfaceNoise = texture(uWaterNoiseTexture, vUv).r;
  // csm_Position.y += waterSurfaceNoise * 0.1; // Adjust height based on noise

  // Small, slow sine wave for subtle movement
  float wave = sin(csm_Position.x * 2.0 + uTime) * 0.02 + sin(csm_Position.z * 2.5 + uTime * 0.7) * 0.015;

  csm_Position.y += wave;
  // csm_PositionRaw 
  vUv = uv;
}
