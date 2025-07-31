uniform sampler2D uWaterNoiseTexture;

varying vec2 vUv;

void main() {

  vec2 scaledUv = fract(vUv * 10.0);

  vec4 waterNoise = texture2D(uWaterNoiseTexture, scaledUv);
 
  // vec3 color = vec3(0.2, 0.384, 0.463);
  vec3 color = vec3(1.0);
  color = mix(color, waterNoise.rgb, 1.0);

  csm_DiffuseColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}
