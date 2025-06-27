function permute(x, y, z) {
  const mod = (a, b) => ((a % b) + b) % b
  return [mod((x * 44.0 + 1.0) * x, 299.0), mod((y * 44.0 + 1.0) * y, 299.0), mod((z * 44.0 + 1.0) * z, 299.0)]
}

export function simplexNoise2d(vx, vy) {
  // Constants from your GLSL
  const C = {
    x: 0.211324865405187,
    y: 0.366025403784439,
    z: -0.577350269189626,
    w: 0.024390243902439,
  }

  // vec2 i = floor(v + dot(v, C.yy));
  const dot_v_Cyy = vx * C.y + vy * C.y
  const ix = Math.floor(vx + dot_v_Cyy)
  const iy = Math.floor(vy + dot_v_Cyy)

  // vec2 x0 = v - i + dot(i, C.xx);
  const dot_i_Cxx = ix * C.x + iy * C.x
  const x0x = vx - ix + dot_i_Cxx
  const x0y = vy - iy + dot_i_Cxx

  // vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  const i1x = x0x > x0y ? 1.0 : 0.0
  const i1y = x0x > x0y ? 0.0 : 1.0

  // vec4 x12 = x0.xyxy + C.xxzz;
  // x12.xy -= i1;
  const x12x = x0x + C.x - i1x
  const x12y = x0y + C.x - i1y
  const x12z = x0x + C.z
  const x12w = x0y + C.z

  // i = mod(i, 299.0);
  const iMod = ((ix % 299) + 299) % 299
  const jMod = ((iy % 299) + 299) % 299

  // vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  const temp1 = permute(jMod + 0.0, jMod + i1y, jMod + 1.0)
  const [p0, p1, p2] = permute(temp1[0] + iMod + 0.0, temp1[1] + iMod + i1x, temp1[2] + iMod + 1.0)

  // vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  let m0 = Math.max(0.5 - (x0x * x0x + x0y * x0y), 0.0)
  let m1 = Math.max(0.5 - (x12x * x12x + x12y * x12y), 0.0)
  let m2 = Math.max(0.5 - (x12z * x12z + x12w * x12w), 0.0)

  // m = m * m; m = m * m;
  m0 = m0 * m0 * m0 * m0
  m1 = m1 * m1 * m1 * m1
  m2 = m2 * m2 * m2 * m2

  // vec3 x = 2.0 * fract(p * C.www) - 1.0;
  const fract = (val) => val - Math.floor(val)
  const x0_final = 2.0 * fract(p0 * C.w) - 1.0
  const x1_final = 2.0 * fract(p1 * C.w) - 1.0
  const x2_final = 2.0 * fract(p2 * C.w) - 1.0

  // vec3 h = abs(x) - 0.5;
  const h0 = Math.abs(x0_final) - 0.5
  const h1 = Math.abs(x1_final) - 0.5
  const h2 = Math.abs(x2_final) - 0.5

  // vec3 ox = floor(x + 0.5);
  const ox0 = Math.floor(x0_final + 0.5)
  const ox1 = Math.floor(x1_final + 0.5)
  const ox2 = Math.floor(x2_final + 0.5)

  // vec3 a0 = x - ox;
  const a0_0 = x0_final - ox0
  const a0_1 = x1_final - ox1
  const a0_2 = x2_final - ox2

  // m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  m0 *= 1.79284291400159 - 0.85373472095314 * (a0_0 * a0_0 + h0 * h0)
  m1 *= 1.79284291400159 - 0.85373472095314 * (a0_1 * a0_1 + h1 * h1)
  m2 *= 1.79284291400159 - 0.85373472095314 * (a0_2 * a0_2 + h2 * h2)

  // vec3 g;
  // g.x = a0.x * x0.x + h.x * x0.y;
  // g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  const g0 = a0_0 * x0x + h0 * x0y
  const g1 = a0_1 * x12x + h1 * x12y
  const g2 = a0_2 * x12z + h2 * x12w

  // return 130.0 * dot(m, g);
  return 130.0 * (m0 * g0 + m1 * g1 + m2 * g2)
}
