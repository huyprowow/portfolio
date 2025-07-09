uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorTopMountain;
uniform vec3 uColorRock;

// Textures

uniform sampler2D uStoneRiverARMTexture;
uniform sampler2D uStoneRiverDiffuseTexture;
uniform sampler2D uStoneRiverDisplacementTexture;
uniform sampler2D uStoneRiverNORMALTexture;

uniform sampler2D uRockMossyARMTexture;
uniform sampler2D uRockMossyDiffuseTexture;
uniform sampler2D uRockMossyDisplacementTexture;
uniform sampler2D uRockMossyNORMALTexture;

uniform sampler2D uAlluvialSoilARMTexture;
uniform sampler2D uAlluvialSoilDiffuseTexture;
uniform sampler2D uAlluvialSoilDisplacementTexture;
uniform sampler2D uAlluvialSoilNORMALTexture;

uniform sampler2D uPebbleGroundARMTexture;
uniform sampler2D uPebbleGroundDiffuseTexture;
uniform sampler2D uPebbleGroundDisplacementTexture;
uniform sampler2D uPebbleGroundNORMALTexture;

uniform sampler2D uRockWallARMTexture;
uniform sampler2D uRockWallDiffuseTexture;
uniform sampler2D uRockWallDisplacementTexture;
uniform sampler2D uRockWallNORMALTexture;

uniform sampler2D uTopMountainARMTexture;
uniform sampler2D uTopMountainDiffuseTexture;
uniform sampler2D uTopMountainDisplacementTexture;
uniform sampler2D uTopMountainNORMALTexture;

#include ../includes/simplexNoise2d.glsl

varying vec3 vPosition;
varying float vUpDot; // dot product with up vector to determine if the surface is facing up
varying vec2 vUv; // bien uv tu vertex shader  

// Triplanar blend function
vec3 blendFactor(vec3 normal, float sharpness) {
  vec3 absNormal = abs(normal);
  absNormal = pow(absNormal, vec3(sharpness));
  float sum = absNormal.x + absNormal.y + absNormal.z;
  return absNormal / max(sum, 0.00001);
}

// Triplanar texture sampling with real tiling
vec4 triplanarTexture(sampler2D tex, vec3 worldPos, vec3 normal, float tiling, float tileSize, float sharpness) {
  vec3 blending = blendFactor(normal, sharpness);

  // Real tiling: UVs in [0,1] range, repeat every tileSize world units
  vec2 xz = mod(worldPos.xz * tiling, tileSize) / tileSize;
  vec2 yz = mod(worldPos.yz * tiling, tileSize) / tileSize;
  vec2 xy = mod(worldPos.xy * tiling, tileSize) / tileSize;

  vec4 x = texture2D(tex, yz);
  vec4 y = texture2D(tex, xz);
  vec4 z = texture2D(tex, xy);

  return x * blending.x + y * blending.y + z * blending.z;
}

void main() {
  float sharpness = 10.0;

  float bottomWaterTiling = 0.5, bottomWaterTileSize = 1.0;
  float sandTiling = 0.5, sandTileSize = 1.0;
  float groundTiling = 0.5, groundTileSize = 1.0;
  float rockTiling = 0.5, rockTileSize = 1.0;
  float topMountainTiling = 0.5, topMountainTileSize = 1.0;

  vec4 textureStoneRiverDiffuse = triplanarTexture(uStoneRiverDiffuseTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  vec4 textureRockMossyDiffuse = triplanarTexture(uRockMossyDiffuseTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  // vec4 textureStoneRiverDiffuse = texture2D(uStoneRiverDiffuseTexture, vUv);
  // vec4 textureAlluvialSoilDiffuse = triplanarTexture(uAlluvialSoilDiffuseTexture, vPosition, normalize(vNormal), sandTiling, sandTileSize, sharpness);
  vec4 texturePebbleGroundDiffuse = triplanarTexture(uPebbleGroundDiffuseTexture, vPosition, normalize(vNormal), groundTiling, groundTileSize, sharpness);
  vec4 textureRockWallDiffuse = triplanarTexture(uRockWallDiffuseTexture, vPosition, normalize(vNormal), rockTiling, rockTileSize, sharpness);
  vec4 textureTopMountainDiffuse = triplanarTexture(uTopMountainDiffuseTexture, vPosition, normalize(vNormal), topMountainTiling, topMountainTileSize, sharpness);

  vec3 color = vec3(1.0); // green color for terrain

  //Color
  float surfaceWaterMix = smoothstep(-1.0, -0.9 , vPosition.y);
  color = mix(textureStoneRiverDiffuse.rgb, textureRockMossyDiffuse.rgb, surfaceWaterMix);

  // sand
  // float sandMix = step(-0.1, vPosition.y);
  // color = mix(color, textureAlluvialSoilDiffuse.rgb, sandMix);

  // grass/GROUND

  float groundMix = step(-0.06, vPosition.y);
  color = mix(color, texturePebbleGroundDiffuse.rgb, groundMix);

  // rock
  //k muon rock ben noai topMountain nen dat no o trc topMountain
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix); // rock only on steep slopes
  rockMix *= step(-0.06, vPosition.y); // rock only above a certain height
  color = mix(color, textureRockWallDiffuse.rgb, rockMix);

  // topMountain
  float topMountainThreshold = 0.45; // threshold for topMountain
  topMountainThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1; // add some noise to the threshold
  float topMountainMix = step(topMountainThreshold, vPosition.y);
  color = mix(color, textureTopMountainDiffuse.rgb, topMountainMix);

  //Final color
  csm_DiffuseColor = vec4(color, 1.0);
}
