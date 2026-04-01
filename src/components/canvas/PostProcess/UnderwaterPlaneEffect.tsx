import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
import { Camera, Matrix4, Texture, Uniform, Vector2 } from 'three'
import fragmentShader from '@/_shaders/postprocessing/underwater/fragment.glsl'

type UnderwaterOpts = {
  blendFunction?: BlendFunction
  blendBand?: number
  underwaterTintStrength?: number
  waterNoiseTexture?: Texture | null
  /** Mặc định (5,5) khớp PlaneGeometry(10,10) căn giữa trong Water.tsx */
  planeHalfExtent?: Vector2
}

export class UnderwaterPlaneEffect extends Effect {
  constructor({
    blendFunction = BlendFunction.SRC,
    blendBand = 0.45,
    underwaterTintStrength = 0.52,
    waterNoiseTexture = null,
    planeHalfExtent = new Vector2(5, 5),
  }: UnderwaterOpts = {}) {
    super('UnderwaterPlaneEffect', fragmentShader, {
      blendFunction,
      attributes: EffectAttribute.DEPTH,
      uniforms: new Map<string, Uniform>([
        ['projectionMatrix', new Uniform(new Matrix4())],
        ['projectionMatrixInverse', new Uniform(new Matrix4())],
        ['cameraMatrixWorld', new Uniform(new Matrix4())],
        ['waterMatrixWorld', new Uniform(new Matrix4())],
        ['waterMatrixWorldInverse', new Uniform(new Matrix4())],
        ['uTime', new Uniform(0)],
        ['blendBand', new Uniform(blendBand)],
        ['underwaterTintStrength', new Uniform(underwaterTintStrength)],
        ['uWaterNoiseTexture', new Uniform(waterNoiseTexture)],
        ['uPlaneHalfExtent', new Uniform(planeHalfExtent.clone())],
      ]),
    })
  }

  syncCameraMatrices(camera: Camera): void {
    this.uniforms.get('projectionMatrix')!.value.copy(camera.projectionMatrix)
    this.uniforms.get('projectionMatrixInverse')!.value.copy(camera.projectionMatrixInverse)
    this.uniforms.get('cameraMatrixWorld')!.value.copy(camera.matrixWorld)
  }

  syncWater(waterMatrixWorld: Matrix4, waterMatrixWorldInverse: Matrix4, elapsedSeconds: number): void {
    this.uniforms.get('waterMatrixWorld')!.value.copy(waterMatrixWorld)
    this.uniforms.get('waterMatrixWorldInverse')!.value.copy(waterMatrixWorldInverse)
    this.uniforms.get('uTime')!.value = elapsedSeconds
  }
}
