uniform float uTime;
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFrequency;
uniform float uWarpStrength;

varying vec3 vPosition;
varying float vUpDot;
varying vec2 vUv;


#include ../includes/simplexNoise2d.glsl

float getElevation(vec2 position) {

  vec2 warpedPosition = position;
  warpedPosition += uTime * 0.2;
  warpedPosition += simplexNoise2d(warpedPosition * uWarpFrequency * uPositionFrequency) * uWarpStrength; // wrap position to create more interesting terrain

  float elevation = 0.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency) / 2.0;//chia elevation ra de k hon 1.0 de ap dung pow tranh tang qua nhanh
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 2.0) / 4.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 4.0) / 8.0;

  float elevationSign = sign(elevation);// luu lai dau cua elevation (vi sau khi pow tat ca deu duong)
  elevation = pow(abs(elevation), 2.0) * elevationSign; // co ca am duong (nui, bien)
  elevation *= uStrength; // scale elevation
  return elevation;
}

void main() {

    // Neighbours position 
  float shift = 0.01;
  vec3 positionA = position + vec3(shift, 0.0, 0.0);
  vec3 positionB = position + vec3(0.0, 0.0, -shift);

    //elevation
  float elevation = getElevation(csm_Position.xz);
  csm_Position.y += elevation;
  positionA.y += getElevation(positionA.xz);
  positionB.y += getElevation(positionB.xz);

    // Compute normal( procedure_terrain caculating normal)
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);
  csm_Normal = cross(toA, toB);

    //Varying
  vPosition = csm_Position;
  vPosition.xz += uTime * 0.2; // add some movement to the position for animation

  vUpDot = dot(csm_Normal, vec3(0.0, 1.0, 0.0)); // dot product with up vector to determine if the surface is facing up
  vUv = uv;

}