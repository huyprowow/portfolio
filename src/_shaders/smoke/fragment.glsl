uniform sampler2D uPerlinTexture;
uniform float uTime;

varying vec2 vUv;

void main() {

    //Scale and animate 
  vec2 smokeUv = vUv;
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * 0.03;

    //Smoke
    // vec4 smoke= texture(uPerlinTexture, vUv);
    // la anh gray scale , ta co the doi sang chi su dung kenh red
  float smoke = texture(uPerlinTexture, smokeUv).r;

    //remap
  smoke = smoothstep(0.4, 1.0, smoke); //Remap from 0.4 to 1.0

    //edge
    // smoke = 1.0; //nay de cho de nhin thoi
  smoke *= smoothstep(0.0, 0.1, vUv.x); //Fade edge on the left
  smoke *= smoothstep(1.0, 0.9, vUv.x); //Fade edge on the right
  smoke *= smoothstep(0.0, 0.1, vUv.y); //Fade edge on the bottom
  smoke *= smoothstep(1.0, 0.4, vUv.y); //Fade edge on the top

    //Final color
  csm_FragColor = vec4(1.0, 1.0, 1.0, smoke);

  // csm_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
