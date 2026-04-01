uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform mat4 cameraMatrixWorld;
uniform mat4 waterMatrixWorld;
uniform mat4 waterMatrixWorldInverse;
uniform float uTime;
uniform float blendBand;
uniform float underwaterTintStrength;
uniform sampler2D uWaterNoiseTexture;
uniform vec2 uPlaneHalfExtent;

vec3 getViewPosition(const in vec2 screenUv, const in float rawDepth, const in float viewZ) {
  vec4 clipPosition = vec4(vec3(screenUv, rawDepth) * 2.0 - 1.0, 1.0);
  float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
  clipPosition *= clipW;
  return (projectionMatrixInverse * clipPosition).xyz;
}

float waterWaveLocal(const in float lx, const in float lz, const in float t) {
  return sin(lx * 2.0 + t) * 0.02 + sin(lz * 2.5 + t * 0.7) * 0.015;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  if (depth >= 1.0 - 1e-5) {
    outputColor = inputColor;
    return;
  }

#ifdef PERSPECTIVE_CAMERA
  float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
#else
  float viewZ = orthographicDepthToViewZ(depth, cameraNear, cameraFar);
#endif

  vec3 viewPos = getViewPosition(uv, depth, viewZ);
  vec4 worldPos = cameraMatrixWorld * vec4(viewPos, 1.0);

  vec4 lw = waterMatrixWorldInverse * worldPos;
  float w = waterWaveLocal(lw.x, lw.z, uTime);
  vec4 worldSurf = waterMatrixWorld * vec4(lw.x, w, lw.z, 1.0);

  float below = worldSurf.y - worldPos.y;
  float mask = smoothstep(0.0, blendBand, below);
  
   // Base giống water/fragment: fract(vUv * 10) ≈ fract(lw.xz + halfExtent)
  // + wiggle cùng pha với sóng vertex (water/vertex.glsl)
  // Van song
  vec2 wavePhase = vec2(lw.x * 2.0 + uTime, lw.z * 2.5 + uTime * 0.7);
  vec2 uvWiggle = vec2(sin(wavePhase.x), sin(wavePhase.y)) * 0.12;

  vec2 scaledUv = fract(vec2(lw.x, lw.z) + uPlaneHalfExtent + uvWiggle);
  vec3 waterSample = texture(uWaterNoiseTexture, scaledUv).rgb;

  vec3 tintColor = mix(inputColor.rgb, waterSample, underwaterTintStrength);
  tintColor *= 0.34;
  vec3 underwaterRgb = mix(inputColor.rgb, tintColor, 0.94);

  outputColor = vec4(mix(inputColor.rgb, underwaterRgb, mask), inputColor.a);
}
