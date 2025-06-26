precision mediump float;

uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

#include ../includes/simplexNoise2d.glsl

varying vec3 vPosition;
varying float vUpDot; // dot product with up vector to determine if the surface is facing up

void main() {

    //Color
  vec3 color = vec3(1.0); // green color for terrain

    // water
  float surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y);
  color = mix(uColorWaterDeep, uColorWaterSurface, surfaceWaterMix);

    // sand
  float sandMix = step(-0.1, vPosition.y);
  color = mix(color, uColorSand, sandMix);

    // grass
  float grassMix = step(-0.06, vPosition.y);
  color = mix(color, uColorGrass, grassMix);

    // rock
    //k muon rock ben noai snow nen dat no o trc snow
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix); // rock only on steep slopes
  rockMix *= step(-0.06, vPosition.y); // rock only above a certain height
  color = mix(color, uColorRock, rockMix);

    // snow
  float snowThreshold = 0.45; // threshold for snow
  snowThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1; // add some noise to the threshold

  float snowMix = step(snowThreshold, vPosition.y);
  color = mix(color, uColorSnow, snowMix);

    //Final color
  csm_DiffuseColor = vec4(color, 1.0);

}