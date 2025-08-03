import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla'
import magicVertexShader from '@/_shaders/magic/vertex.glsl'
import magicFragmentShader from '@/_shaders/magic/fragment.glsl'
import shieldVertexShader from '@/_shaders/shield/vertex.glsl'
import shieldFragmentShader from '@/_shaders/shield/fragment.glsl'
import { Assets } from '@/helpers/assetMap'

interface SkillVFXProps {
  type: 'attack' | 'block' | 'powerUp'
  position: [number, number, number]
  duration?: number
  rotation?: [number, number, number]
  onComplete?: () => void
}

const SkillVFX: React.FC<SkillVFXProps> = ({ type, position, rotation = [0, 0, 0], duration = 2000, onComplete }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const startTime = useRef(0)
  const isActive = useRef(true)
  // Add debug logging
  useEffect(() => {
    console.log(`SkillVFX created: ${type} at position:`, position)
  }, [type, position])

  const createShieldGeometry = () => {
    const shape = new THREE.Shape()

    // Create hexagon points
    const radius = 4.5
    const sides = 6
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius

      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    }
    shape.closePath()

    // Extrude the shape to make it flat but with some depth
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: false,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }
  // Geometry based on skill type
  const geometry = useMemo(() => {
    switch (type) {
      case 'attack':
        return new THREE.SphereGeometry(0.5, 16, 16)
      case 'block':
        return createShieldGeometry()
      case 'powerUp':
        return new THREE.SphereGeometry(5, 128, 128, 8)
      default:
        return new THREE.SphereGeometry(0.5, 16, 16)
    }
  }, [type])

  // Material with custom shader
  const material = useMemo(() => {
    if (type === 'block') {
      // Shield material with custom shader
      const uniforms = {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(getSkillColor(type))),
        uIntensity: new THREE.Uniform(1.0),
        uShieldRadius: new THREE.Uniform(2.0),
      }

      return new CustomShaderMaterialVanilla({
        vertexShader: shieldVertexShader,
        fragmentShader: shieldFragmentShader,
        baseMaterial: THREE.MeshStandardMaterial,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    } else {
      const uniforms = {
        uTime: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color(getSkillColor(type))),
        uIntensity: new THREE.Uniform(1.0),
        uPulseSpeed: new THREE.Uniform(3.0),
      }

      return new CustomShaderMaterialVanilla({
        vertexShader: magicVertexShader,
        fragmentShader: magicFragmentShader,
        baseMaterial: THREE.MeshStandardMaterial,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    }
  }, [type])

  // Skill-specific colors
  function getSkillColor(skillType: string): number {
    switch (skillType) {
      case 'attack':
        return 0xff4444 // Red
      case 'block':
        return 0x44ff44 // Green
      case 'powerUp':
        return 0x4444ff // Blue
      default:
        return 0xffffff // White
    }
  }

  useFrame((state) => {
    if (!meshRef.current || !isActive.current) return

    // Set start time on first frame
    if (startTime.current === 0) {
      startTime.current = state.clock.getElapsedTime()
      console.log(`SkillVFX started: ${type}`)
    }

    const elapsed = state.clock.getElapsedTime()
    const timeSinceStart = elapsed - startTime.current
    const progress = timeSinceStart / (duration / 1000)

    // Update shader uniforms
    material.uniforms.uTime.value = elapsed
    material.uniforms.uIntensity.value = 1.0 - progress

    // Scale and fade out effectx
    if (meshRef.current) {
      if (type === 'powerUp') {
        const scale = 1 + progress * 2
        meshRef.current.scale.setScalar(scale)
      }
    }

    // End effect
    if (progress >= 1.0) {
      isActive.current = false
      onComplete?.()
    }
  })

  useEffect(() => {
    startTime.current = 0

    return () => {
      material.dispose()
      geometry.dispose()
    }
  }, [])

  if (!isActive.current) return null

  return <mesh ref={meshRef} geometry={geometry} material={material} position={position} rotation={rotation} />
}

export default SkillVFX
