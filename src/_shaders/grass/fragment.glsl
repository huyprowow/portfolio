// uniform sampler2D texture1;
uniform sampler2D textures[2];
uniform float uMapScale;

varying vec2 vUv;
varying vec2 vCloudUV;
varying vec3 vWorldPosition;

void main() {
  vec2 worldUv = fract(vWorldPosition.xz / uMapScale);

  float contrast = 1.5;
  float brightness = 0.1;
  vec3 color = texture2D(textures[0], worldUv).rgb * contrast;
  color = color + vec3(brightness, brightness, brightness);
  color = mix(color, texture2D(textures[1], vCloudUV).rgb, 0.4);

  csm_DiffuseColor = vec4(color, 1.0);
}
