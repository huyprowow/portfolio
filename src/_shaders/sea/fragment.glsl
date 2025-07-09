uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {

  float mixStrength = uColorMultiplier * (vElevation + uColorOffset);
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
  gl_FragColor = vec4(color, 1.0); // Set the fragment color to blue

    // Trong phiên bản mới nhất của Three.js, chúng ta cần xuất màu theo không gian màu sRGB.
    // Để thực hiện điều đó, hãy thêm dòng sau vào cuối trình đổ bóng phân đoạn.
    #include <colorspace_fragment>
}