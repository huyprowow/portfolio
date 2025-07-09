
void main() {
  vec3 color = vec3(0.2, 0.384, 0.463);
  csm_DiffuseColor = vec4(color, 1.0);

  #include <colorspace_fragment>
}