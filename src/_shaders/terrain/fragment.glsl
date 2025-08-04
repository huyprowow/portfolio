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
varying float vUpDot;
varying vec2 vUv;

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

// Function to decode normal from texture
vec3 decodeNormal(vec4 normalMap) {
  vec3 normal = normalize(normalMap.rgb * 2.0 - 1.0);
  return normal;
}

// Function to blend PBR properties
vec4 blendPBRProperties(vec4 baseColor, vec4 arm, vec3 normal, float blendFactor) {
  // ARM texture contains: R = AO, G = Roughness, B = Metallic
  vec4 blendedColor = mix(baseColor, arm, blendFactor);
  return blendedColor;
}

void main() {
  float sharpness = 10.0;

  float bottomWaterTiling = 0.5, bottomWaterTileSize = 1.0;
  float sandTiling = 0.5, sandTileSize = 1.0;
  float groundTiling = 0.5, groundTileSize = 1.0;
  float rockTiling = 0.5, rockTileSize = 1.0;
  float topMountainTiling = 0.5, topMountainTileSize = 1.0;

  // Sample all textures with triplanar mapping
  vec4 textureStoneRiverDiffuse = triplanarTexture(uStoneRiverDiffuseTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  vec4 textureStoneRiverARM = triplanarTexture(uStoneRiverARMTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  vec4 textureStoneRiverNormal = triplanarTexture(uStoneRiverNORMALTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);

  vec4 textureRockMossyDiffuse = triplanarTexture(uRockMossyDiffuseTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  vec4 textureRockMossyARM = triplanarTexture(uRockMossyARMTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);
  vec4 textureRockMossyNormal = triplanarTexture(uRockMossyNORMALTexture, vPosition, normalize(vNormal), bottomWaterTiling, bottomWaterTileSize, sharpness);

  vec4 texturePebbleGroundDiffuse = triplanarTexture(uPebbleGroundDiffuseTexture, vPosition, normalize(vNormal), groundTiling, groundTileSize, sharpness);
  vec4 texturePebbleGroundARM = triplanarTexture(uPebbleGroundARMTexture, vPosition, normalize(vNormal), groundTiling, groundTileSize, sharpness);
  vec4 texturePebbleGroundNormal = triplanarTexture(uPebbleGroundNORMALTexture, vPosition, normalize(vNormal), groundTiling, groundTileSize, sharpness);

  vec4 textureRockWallDiffuse = triplanarTexture(uRockWallDiffuseTexture, vPosition, normalize(vNormal), rockTiling, rockTileSize, sharpness);
  vec4 textureRockWallARM = triplanarTexture(uRockWallARMTexture, vPosition, normalize(vNormal), rockTiling, rockTileSize, sharpness);
  vec4 textureRockWallNormal = triplanarTexture(uRockWallNORMALTexture, vPosition, normalize(vNormal), rockTiling, rockTileSize, sharpness);

  vec4 textureTopMountainDiffuse = triplanarTexture(uTopMountainDiffuseTexture, vPosition, normalize(vNormal), topMountainTiling, topMountainTileSize, sharpness);
  vec4 textureTopMountainARM = triplanarTexture(uTopMountainARMTexture, vPosition, normalize(vNormal), topMountainTiling, topMountainTileSize, sharpness);
  vec4 textureTopMountainNormal = triplanarTexture(uTopMountainNORMALTexture, vPosition, normalize(vNormal), topMountainTiling, topMountainTileSize, sharpness);

  // Initialize PBR properties
  vec3 finalColor = vec3(1.0);
  float finalRoughness = 0.5;
  float finalMetallic = 0.0;
  float finalAO = 1.0;
  vec3 finalNormal = normalize(vNormal);
  vec3 finalBump = vec3(0.0);

  // Blend based on height and slope
  float surfaceWaterMix = smoothstep(-1.0, -0.9, vPosition.y);
  // float sandMix = step(-0.1, vPosition.y);
  float groundMix = step(-0.06, vPosition.y);
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix); // rock only on steep slopes
  rockMix *= step(-0.06, vPosition.y); // rock only above a certain height

  // grass/GROUND

  // Water/River areas (lowest elevation)
  if (surfaceWaterMix > 0.0) {
    finalColor = mix(textureStoneRiverDiffuse.rgb, textureRockMossyDiffuse.rgb, surfaceWaterMix);
    finalRoughness = mix(textureStoneRiverARM.g, textureRockMossyARM.g, surfaceWaterMix);
    finalMetallic = mix(textureStoneRiverARM.b, textureRockMossyARM.b, surfaceWaterMix);
    finalAO = mix(textureStoneRiverARM.r, textureRockMossyARM.r, surfaceWaterMix);

      // Blend bump/normal
    vec3 stoneRiverBump = decodeNormal(textureStoneRiverNormal);
    vec3 rockMossyBump = decodeNormal(textureRockMossyNormal);
    finalBump = mix(stoneRiverBump, rockMossyBump, surfaceWaterMix);
  }

  // sand
  // if (sandMix > 0.0) {
  //   finalColor = mix(finalColor, textureAlluvialSoilDiffuse.rgb, sandMix);
  //   finalRoughness = mix(finalRoughness, textureAlluvialSoilARM.g, sandMix);
  //   finalMetallic = mix(finalMetallic, textureAlluvialSoilARM.b, sandMix);
  //   finalAO = mix(finalAO, textureAlluvialSoilARM.r, sandMix);

  // }

  // Ground areas (middle elevation)
  if (groundMix > 0.0) {
    finalColor = mix(finalColor, texturePebbleGroundDiffuse.rgb, groundMix);
    finalRoughness = mix(finalRoughness, texturePebbleGroundARM.g, groundMix);
    finalMetallic = mix(finalMetallic, texturePebbleGroundARM.b, groundMix);
    finalAO = mix(finalAO, texturePebbleGroundARM.r, groundMix);

    // Blend bump/normal
    vec3 pebbleGroundBump = decodeNormal(texturePebbleGroundNormal);
    finalBump = mix(finalBump, pebbleGroundBump, groundMix);
  }

  // Rock areas (steep slopes)
  if (rockMix > 0.0) {
    finalColor = mix(finalColor, textureRockWallDiffuse.rgb, rockMix);
    finalRoughness = mix(finalRoughness, textureRockWallARM.g, rockMix);
    finalMetallic = mix(finalMetallic, textureRockWallARM.b, rockMix);
    finalAO = mix(finalAO, textureRockWallARM.r, rockMix);

        // Blend bump/normal
    vec3 rockWallBump = decodeNormal(textureRockWallNormal);
    finalBump = mix(finalBump, rockWallBump, rockMix);
  }

  // Top mountain areas (highest elevation) - uncomment if needed
  // float topMountainThreshold = 0.45;
  // topMountainThreshold += simplexNoise2d(vPosition.xz * 15.0) * 0.1;
  // float topMountainMix = step(topMountainThreshold, vPosition.y);
  // if (topMountainMix > 0.0) {
  //   finalColor = mix(finalColor, textureTopMountainDiffuse.rgb, topMountainMix);
  //   finalRoughness = mix(finalRoughness, textureTopMountainARM.g, topMountainMix);
  //   finalMetallic = mix(finalMetallic, textureTopMountainARM.b, topMountainMix);
  //   finalAO = mix(finalAO, textureTopMountainARM.r, topMountainMix);
  //   
  //   vec3 topMountainBump = decodeNormal(textureTopMountainNormal);
  //   finalBump = mix(finalBump, topMountainBump, topMountainMix);
  // }

  // Apply PBR properties to the material
  csm_DiffuseColor = vec4(finalColor, 1.0);
  csm_Roughness = finalRoughness;
  csm_Metalness = finalMetallic;
  csm_Bump = finalBump; // Use csm_Bump for normal mapping
  csm_DiffuseColor.rgb *= finalAO;
  // csm_AO = finalAO;

  #include <colorspace_fragment>

}
