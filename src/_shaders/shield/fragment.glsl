uniform float uTime;
uniform vec3 uColor;
uniform float uIntensity;
uniform float uShieldRadius;

varying vec3 vWorldPos;
varying vec2 vUv;

#include ../includes/snoise.glsl

void main() {
  // Create hexagonal shield pattern
  vec2 center = vec2(0.5, 0.5);
  vec2 uv = vUv - center;

  // Create hexagon mask
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);
  float hexagon = cos(floor(0.5 + angle / 1.047197551) * 1.047197551 - angle) * radius;
  float hexMask = smoothstep(0.4, 0.5, hexagon);

  // Create shield ripple effect
  float ripple = sin(radius * 20.0 - uTime * 3.0) * 0.5 + 0.5;

  // Add noise for organic movement
  vec3 noisePos = vWorldPos * 2.0 + uTime * 0.5;
  float noise = snoise(noisePos) * 0.3 + 0.7;

  // Create shield edge glow
  float edge = 1.0 - smoothstep(0.3, 0.4, radius);
  float centerGlow = smoothstep(0.0, 0.2, radius);

  // Combine effects
  float alpha = uIntensity;
  // Test từng effect một
  // alpha *= ripple; // Uncomment để test ripple
  alpha *= noise;   // Uncomment để test noise  
  // alpha *= edge;    // Uncomment để test edge
  alpha *= centerGlow; // Uncomment để test centerGlow
  // alpha *= hexMask; // Uncomment để test hexMask

  vec3 color = uColor * (1.0  * 0.5);

  csm_DiffuseColor = vec4(color, alpha);

   #include <colorspace_fragment>
}
