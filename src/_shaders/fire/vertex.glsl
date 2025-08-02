varying vec3 vWorldPos;
void main() {

  csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(csm_Position, 1.0);

  vWorldPos = (modelMatrix * vec4(csm_Position, 1.0)).xyz;
}
