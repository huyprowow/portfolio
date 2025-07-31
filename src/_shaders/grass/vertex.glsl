uniform float uTime;

varying vec2 vUv;
varying vec2 vCloudUV;
varying vec3 vWorldPosition;
uniform float uWindStrength;

void main() {
  vCloudUV = uv;

  vec3 pos = csm_Position;
  // Base wind
  float baseWind = sin(uTime * 1.2) * 0.3;

  // Wind gusts
  float gust = sin(uTime * 0.3) * 0.7;
  gust = smoothstep(0.0, 1.0, gust);

  // Combined wind effect
  float wind = (baseWind + gust) * uWindStrength;

  // Height-based displacement
  float heightFactor = clamp(pos.y / 2.0, 0.0, 1.0);

  pos.x += wind * heightFactor * 0.2;

  vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);

  //varying
  vUv = uv;
  vWorldPosition = worldPosition.xyz;

  csm_PositionRaw = projectionMatrix * viewMatrix * worldPosition;
}
