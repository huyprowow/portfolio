varying vec2 vUv;
varying vec2 cloudUV;

uniform float iTime;

void main() {
  vUv = uv;
  cloudUV = uv;
  // vec3 cpos = position;

  // float waveSize = 1.0;
  // float tipDistance = 0.3;
  // float centerDistance = 0.1;

  // if (color.x > 0.6) {
  //   cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * tipDistance;
  // } else if (color.x > 0.0) {
  //   cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * centerDistance;
  // }

  // float diff = position.x - cpos.x;
  // cloudUV.x += iTime / 20000.0;
  // cloudUV.y += iTime / 10000.0;

  // vec4 worldPosition = instanceMatrix * vec4(cpos, 1.0);
  // csm_PositionRaw = projectionMatrix * modelViewMatrix * worldPosition;

  vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
  vec4 modelPosition = modelMatrix * worldPosition;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  csm_PositionRaw = projectionPosition;

}
