// uniform sampler2D texture1;
uniform sampler2D textures[2];

varying vec2 vUv;
varying vec2 cloudUV;

void main() {
  float contrast = 1.5;
  float brightness = 0.1;
  vec3 color = texture2D(textures[0], vUv).rgb * contrast;
  color = color + vec3(brightness, brightness, brightness);
  color = mix(color, texture2D(textures[1], cloudUV).rgb, 0.4);

  csm_DiffuseColor = vec4(color, 1.0);
}
