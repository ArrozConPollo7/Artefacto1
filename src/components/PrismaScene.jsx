import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────
   PCB Strip behind gold pins
   ───────────────────────────────────────────── */
function PCBStrips() {
  return (
    <>
      {[-1.28, 1.28].map((x, idx) => (
        <mesh key={idx} position={[x, -0.945, 0]}>
          <boxGeometry args={[0.06, 0.22, 1.72]} />
          <meshStandardMaterial color="#0d2a0d" roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────
   Pines de Oro Laterales (14 pines por lado)
   ───────────────────────────────────────────── */
function GoldenConnectorPins() {
  const pinCount = 14
  const spacing = 0.115
  const start = -((pinCount - 1) * spacing) / 2
  const sides = [-1.27, 1.27]

  return (
    <>
      {sides.map((x, sideIdx) => {
        const pins = []
        for (let i = 0; i < pinCount; i++) {
          const z = start + i * spacing
          pins.push(
            <group key={`pin-gp-${i}`}>
              <mesh position={[x, -0.945, z]} castShadow>
                <boxGeometry args={[0.055, 0.21, 0.065]} />
                <meshStandardMaterial 
                  color="#b8841e" 
                  roughness={0.1} 
                  metalness={1.0} 
                  envMapIntensity={1.5} 
                />
              </mesh>
              <mesh position={[x, -1.06, z]}>
                <boxGeometry args={[0.07, 0.04, 0.08]} />
                <meshStandardMaterial 
                  color="#b8841e" 
                  roughness={0.1} 
                  metalness={1.0} 
                  envMapIntensity={1.5} 
                />
              </mesh>
            </group>
          )
        }
        return <group key={sideIdx}>{pins}</group>
      })}
    </>
  )
}

/* ─────────────────────────────────────────────
   Cenotafio Fotónico (Modelo R3F Reconstruido)
   ───────────────────────────────────────────── */
function PhotonicModel({ autoRotateSpeed, redCoreRef, bluePointRef, ledMatRef, netMatRef, sphereMatsRef, edgesRef }) {
  const rootRef = useRef()
  const rotY = useRef(0.52)
  const rotX = useRef(0.26)
  const velY = useRef(0)

  // 1. Drag orbital manual
  useEffect(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    let dragging = false
    let lastX = 0
    let lastY = 0

    const onDown = (x, y) => {
      dragging = true
      lastX = x
      lastY = y
      velY.current = 0
    }

    const onMove = (x, y) => {
      if (!dragging) return
      const dX = x - lastX
      const dY = y - lastY
      velY.current = dX * 0.007
      rotY.current += velY.current
      rotX.current += dY * 0.004
      rotX.current = Math.max(-0.55, Math.min(0.55, rotX.current))
      lastX = x
      lastY = y
    }

    const onUp = () => {
      dragging = false
    }

    const handleMouseDown = (e) => onDown(e.clientX, e.clientY)
    const handleMouseMove = (e) => onMove(e.clientX, e.clientY)
    const handleMouseUp = onUp

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    const handleTouchStart = (e) => onDown(e.touches[0].clientX, e.touches[0].clientY)
    const handleTouchMove = (e) => onMove(e.touches[0].clientX, e.touches[0].clientY)
    const handleTouchEnd = onUp

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // 2. Animaciones de rotación orbital inercial
  useFrame((state, delta) => {
    const dragging = false // actual dragging state handled in events
    velY.current *= 0.96 // decay
    velY.current += autoRotateSpeed * 0.12
    rotY.current += autoRotateSpeed + velY.current

    if (rootRef.current) {
      rootRef.current.rotation.y = rotY.current
      rootRef.current.rotation.x = rotX.current
    }
  })

  // ── Red Fotónica de Nodos y Filamentos ─────────────────────────────────
  const R = 0.64 // Radio de la red
  
  const nodePositions = useMemo(() => {
    const positions = []
    
    // 8 Esquinas
    for (const x of [-R, R]) {
      for (const y of [-R, R]) {
        for (const z of [-R, R]) {
          positions.push(new THREE.Vector3(x, y + 0.08, z))
        }
      }
    }

    // 6 Centros de caras
    [
      [R, 0, 0], [-R, 0, 0],
      [0, R, 0], [0, -R, 0],
      [0, 0, R], [0, 0, -R]
    ].forEach(([x, y, z]) => {
      positions.push(new THREE.Vector3(x, y + 0.08, z))
    })

    // 12 Puntos medios de bordes
    const em = R * 0.82
    [
      [em, em, 0], [em, -em, 0], [-em, em, 0], [-em, -em, 0],
      [0, em, em], [0, em, -em], [0, -em, em], [0, -em, -em],
      [em, 0, em], [em, 0, -em], [-em, 0, em], [-em, 0, -em]
    ].forEach(([x, y, z]) => {
      positions.push(new THREE.Vector3(x, y + 0.08, z))
    })

    // Nodos internos adicionales
    const im = R * 0.42
    [
      [im, im, im], [im, im, -im], [im, -im, im], [-im, im, im],
      [im, -im, -im], [-im, im, -im], [-im, -im, im], [-im, -im, -im]
    ].forEach(([x, y, z]) => {
      positions.push(new THREE.Vector3(x, y + 0.08, z))
    })

    // Centro
    positions.push(new THREE.Vector3(0, 0.08, 0))

    return positions
  }, [])

  // Líneas de filamentos interconectados
  const lineVerts = useMemo(() => {
    const verts = []
    const CONNECT_DIST = 1.08
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < CONNECT_DIST) {
          verts.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          )
        }
      }
    }
    return new Float32Array(verts)
  }, [nodePositions])

  // ── Textura del Lienzo de Etiquetas (Frontal del cristal) ───────────────
  const labelTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, 512, 512)

    ctx.fillStyle = "rgba(255,255,255,0.78)"
    ctx.font = "bold 24px monospace"
    ctx.fillText("PHOTONIC CODE CENOTAPH", 16, 52)
    ctx.font = "22px monospace"
    ctx.fillText("// SECURE DATA VAULT 2066", 16, 86)

    ctx.fillStyle = "rgba(255,255,255,0.50)"
    ctx.font = "17px monospace"
    ctx.fillText("MODEL: PH-CEN-X1", 16, 148)
    ctx.fillText("TYPE: HIGH-SECURITY DATA ISOLATOR", 16, 178)
    ctx.fillText("INTEGRITY SEAL: VERIFIED", 16, 208)

    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  return (
    <group ref={rootRef}>
      {/* Luces puntuales internas al grupo que rota */}
      <pointLight ref={redCoreRef} color={0xff1020} intensity={3.5} distance={4.0} position={[0, 0.08, 0]} />
      <pointLight ref={bluePointRef} color={0x1144ff} intensity={1.5} distance={1.8} position={[0.52, -0.87, 1.01]} />

      {/* ── BASE PLATES (Chasis y Acoplamiento) ─────────────────────────── */}
      {/* Base slab principal */}
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.26, 2.5]} />
        <meshStandardMaterial color={0x18181c} roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Ajuste inferior biselado */}
      <mesh position={[0, -1.24, 0]}>
        <boxGeometry args={[2.58, 0.07, 2.58]} />
        <meshStandardMaterial color={0x111115} roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Plataforma superior de acoplamiento */}
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <boxGeometry args={[1.82, 0.12, 1.82]} />
        <meshStandardMaterial color={0x111115} roughness={0.25} metalness={0.85} />
      </mesh>

      {/* Cortes diagonales de las esquinas */}
      {[
        [-1.12, -1.1, -1.12],
        [1.12, -1.1, -1.12],
        [-1.12, -1.1, 1.12],
        [1.12, -1.1, 1.12]
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.08, 0.08, 0.28, 8]} />
          <meshStandardMaterial color={0x0e0e11} roughness={0.2} metalness={0.9} />
        </mesh>
      ))}

      {/* ── CONECTORES Y PINES DORADOS ─────────────────────────────────── */}
      <PCBStrips />
      <GoldenConnectorPins />

      {/* ── LED STANDBY AZUL Y ETIQUETA ────────────────────────────────── */}
      <mesh position={[0.52, -0.875, 1.02]}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial 
          ref={ledMatRef}
          color={0x1155ff} 
          emissive={0x0033ff} 
          emissiveIntensity={5} 
          roughness={0} 
          metalness={0} 
        />
      </mesh>
      <mesh position={[0.52, -0.875, 1.09]}>
        <boxGeometry args={[0.28, 0.03, 0.08]} />
        <meshStandardMaterial color={0x0a0a0d} roughness={0.2} />
      </mesh>

      {/* ── CUBO DE CRISTAL PRINCIPAL (Caja de 1.72) ───────────────────── */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.72, 1.72, 1.72]} />
        <meshPhysicalMaterial 
          color={0xd0e0f0}
          transparent={true}
          opacity={0.1}
          roughness={0.0}
          metalness={0.0}
          transmission={0.94}
          thickness={0.6}
          ior={1.52}
          reflectivity={0.9}
          envMapIntensity={1.0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Bordes brillantes del cristal */}
      <lineSegments position={[0, 0.08, 0]} ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.72, 1.72, 1.72)]} />
        <lineBasicMaterial color={0xffffff} transparent={true} opacity={0.55} />
      </lineSegments>

      {/* Cubo interior secundario (finge profundidad óptica) */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.72 * 0.98, 1.72 * 0.98, 1.72 * 0.98]} />
        <meshPhysicalMaterial
          color={0x8899bb}
          transparent={true}
          opacity={0.06}
          roughness={0.0}
          transmission={0.96}
          thickness={0.3}
          ior={1.52}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── RED FOTÓNICA DE FILAMENTOS ─────────────────────────────────── */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            args={[lineVerts, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial ref={netMatRef} color={0xff1830} transparent={true} opacity={0.9} />
      </lineSegments>

      {/* Nodos esféricos de la red */}
      {nodePositions.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial 
            ref={el => sphereMatsRef.current[idx] = el}
            color={0xff2040}
            emissive={0xff0828}
            emissiveIntensity={3.5}
            roughness={0}
          />
        </mesh>
      ))}

      {/* Etiqueta del lienzo frontal */}
      <mesh position={[0, 0.08, 1.72 / 2 + 0.002]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial 
          map={labelTexture} 
          transparent={true} 
          opacity={0.6} 
          depthWrite={false} 
        />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────────
   Camera Controller (Scroll scrollytelling)
   ───────────────────────────────────────────── */
function CameraController({ scrollProgress }) {
  const { camera, viewport } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 1.4, 5.8))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.1, 0))

  useFrame(() => {
    const p = scrollProgress?.current || 0
    const xShift = Math.min(viewport.width / 8, 1.2)

    let pos, lookAt
    if (p < 0.25) {
      pos = new THREE.Vector3(xShift * 0.5, 1.4, 5.8)
      lookAt = new THREE.Vector3(0, 0.1, 0)
    } else if (p < 0.5) {
      const t = (p - 0.25) / 0.25
      const eased = t * t * (3 - 2 * t)
      pos = new THREE.Vector3(
        xShift * 0.5 - eased * (xShift * 1.5),
        1.4 - eased * 0.4,
        5.8 - eased * 1.8
      )
      lookAt = new THREE.Vector3(-eased * xShift * 0.2, 0.1, 0)
    } else if (p < 0.75) {
      const t = (p - 0.5) / 0.25
      const eased = t * t * (3 - 2 * t)
      pos = new THREE.Vector3(
        -xShift + eased * (xShift * 1.2),
        1.0 + eased * 0.6,
        4.0 + eased * 1.2
      )
      lookAt = new THREE.Vector3(0, 0.2, 0)
    } else {
      const t = (p - 0.75) / 0.25
      const eased = t * t * (3 - 2 * t)
      pos = new THREE.Vector3(
        xShift * 0.2 - eased * (xShift * 0.6),
        1.6 - eased * 0.8,
        5.2 + eased * 1.5
      )
      lookAt = new THREE.Vector3(0, 0.1, 0)
    }

    targetPos.current.lerp(pos, 0.04)
    targetLookAt.current.lerp(lookAt, 0.04)

    camera.position.copy(targetPos.current)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

/* ─────────────────────────────────────────────
   Componente Principal PrismaScene (Exportado)
   ───────────────────────────────────────────── */
export default function PrismaScene({ scrollProgress, emissionIntensity = 0, autoRotateSpeed = 0.003 }) {
  const redCoreRef = useRef()
  const bluePointRef = useRef()
  const ledMatRef = useRef()
  const netMatRef = useRef()
  const edgesRef = useRef()
  const sphereMatsRef = useRef([])
  const timeRef = useRef(0)

  // 3. Animación de incandescencia y pulsaciones
  useFrame((state, delta) => {
    timeRef.current += delta
    const t = timeRef.current

    // Pulsar luz roja interna, potenciada dramáticamente por el scroll de condena
    const boost = emissionIntensity * 7.5
    const pulse = 0.5 + Math.sin(t * 2.4) * 0.5
    
    if (redCoreRef.current) {
      redCoreRef.current.intensity = 2.0 + pulse * 3.0 + boost
    }
    if (netMatRef.current) {
      // Si la intensidad de emisión es baja, el láser es más sutil. Al condenar se vuelve denso e hiper-brillante.
      netMatRef.current.opacity = 0.35 + (pulse * 0.30 + emissionIntensity * 0.55)
    }
    sphereMatsRef.current.forEach(mat => {
      if (mat) {
        mat.emissiveIntensity = 2.5 + pulse * 2.5 + boost * 2.0
      }
    })

    // Parpadeo LED azul
    if (ledMatRef.current) {
      ledMatRef.current.emissiveIntensity = 4 + Math.sin(t * 5.5) * 1.5
    }
    if (bluePointRef.current) {
      bluePointRef.current.intensity = 0.9 + Math.sin(t * 5.5) * 0.4
    }

    // Brillo oscilante en los bordes del cristal
    if (edgesRef.current && edgesRef.current.material) {
      edgesRef.current.material.opacity = 0.4 + pulse * 0.2
    }
  })

  return (
    <>
      {/* Fondo industrial de escena */}
      <color attach="background" args={[0x0a0a0a]} />
      {/* Niebla sutil que aporta profundidad */}
      <fogExp2 attach="fog" args={[0x0a0a0a, 0.06]} />

      <CameraController scrollProgress={scrollProgress} />

      {/* ── ILUMINACIÓN INDUSTRIAL COMPLETA ───────────────────────────────── */}
      <ambientLight color={0x111318} intensity={2.5} />
      
      {/* Key light desde arriba-izquierda con sombras suaves */}
      <directionalLight
        color={0xdce8ff}
        intensity={1.8}
        position={[-3, 5, 4]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Fill light cálida desde la derecha */}
      <directionalLight
        color={0xffe8cc}
        intensity={0.5}
        position={[4, 2, -2]}
      />

      {/* Rim light trasera-superior para brillo de bordes en cristal */}
      <directionalLight
        color={0xaabbff}
        intensity={0.9}
        position={[0, 4, -5]}
      />

      {/* Entorno de estudio sutil */}
      <Environment preset="studio" environmentIntensity={0.5} />

      {/* Artefacto Cenotafio */}
      <PhotonicModel 
        autoRotateSpeed={autoRotateSpeed}
        redCoreRef={redCoreRef}
        bluePointRef={bluePointRef}
        ledMatRef={ledMatRef}
        netMatRef={netMatRef}
        sphereMatsRef={sphereMatsRef}
        edgesRef={edgesRef}
      />
    </>
  )
}
