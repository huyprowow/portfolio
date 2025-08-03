uniform vec3 color;
uniform float uTime;
uniform float uSeed;
uniform mat4 uInvModelMatrix;
uniform vec3 uScale;
uniform vec4 uNoiseScale;
uniform float uMagnitude;
uniform float uLacunarity;
uniform float uGain;
uniform sampler2D uFireTex;
varying vec3 vWorldPos;

#include ../includes/snoise.glsl

float turbulence(vec3 p) {
  float sum = 0.0;
  float freq = 1.0;
  float amp = 1.0;
  for (int i = 0; i < OCTIVES; i++) {
    sum += abs(snoise(p * freq)) * amp;
    freq *= uLacunarity;
    amp *= uGain;
  }
  return sum;
}

vec4 samplerFire(vec3 p, vec4 uScale) {
  vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);
  if (st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0)
    return vec4(0.0);
  p.y -= (uSeed + uTime) * uScale.w;
  p *= uScale.xyz;
  st.y += sqrt(st.y) * uMagnitude * turbulence(p);
  if (st.y <= 0.0 || st.y >= 1.0)
    return vec4(0.0);
  return texture2D(uFireTex, st);
}

vec3 localize(vec3 p) {
  return (uInvModelMatrix * vec4(p, 1.0)).xyz;
}

void main() {
  vec3 rayPos = vWorldPos;
  vec3 rayDir = normalize(rayPos - cameraPosition);
  float rayLen = 0.0288 * length(uScale.xyz);
  vec4 col = vec4(0.0);
  for (int i = 0; i < ITERATIONS; i++) {
    rayPos += rayDir * rayLen;
    vec3 lp = localize(rayPos);
    lp.y += 0.5;
    lp.xz *= 2.0;
    col += samplerFire(lp, uNoiseScale);
  }
  col.a = col.r;
  csm_DiffuseColor = col;
  // csm_DiffuseColor = vec4(1.0, 0.0, 0.0, 1.0);
}
