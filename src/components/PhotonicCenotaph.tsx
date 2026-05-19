"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CenotaphOptions {
  scrollProgress: React.MutableRefObject<number>;
  emissionIntensity: number;
}

export default function PhotonicCenotaph({ scrollProgress, emissionIntensity }: CenotaphOptions) {
  const mountRef = useRef<HTMLDivElement>(null);
  const emissionRef = useRef(emissionIntensity);

  // Sync emission intensity reactively without recreating the entire scene
  useEffect(() => {
    emissionRef.current = emissionIntensity;
  }, [emissionIntensity]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(W, H);
    // Limit DPR on mobile to save GPU fill rate (max 1.5)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.055);

    // Synthetic PMREMGenerator env map for glass/metal reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envS = new THREE.Scene();
    [
      { c: 0xff1030, p: [-6, 4, 6] as [number,number,number], i: 10 },
      { c: 0x2233ff, p: [6, -3, -6] as [number,number,number], i: 5 },
      { c: 0xffffff, p: [0, 10, 0] as [number,number,number], i: 8 },
      { c: 0xffcc44, p: [4, 2, 4] as [number,number,number], i: 3 },
    ].forEach(({ c, p, i }) => {
      const l = new THREE.PointLight(c, i, 30);
      l.position.set(...p);
      envS.add(l);
    });
    const envRT = pmrem.fromScene(envS);
    scene.environment = envRT.texture;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 60);
    // Initial hero banner position
    camera.position.set(0.4, 1.25, 5.6);
    camera.lookAt(0, 0.1, 0);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x0e0e18, 3.2));

    const key = new THREE.DirectionalLight(0xddeeff, 2.6);
    key.position.set(-3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    key.shadow.camera.far = 25;
    key.shadow.bias = -0.0008;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x7788ff, 1.6);
    rim.position.set(2, 4, -6);
    scene.add(rim);

    const fillLight = new THREE.DirectionalLight(0xffe8cc, 0.7);
    fillLight.position.set(5, 1, 3);
    scene.add(fillLight);

    const redCore = new THREE.PointLight(0xff1020, 3.0, 5.5);
    redCore.position.set(0, 0.1, 0);
    const bluePoint = new THREE.PointLight(0x1133ff, 2.2, 2.5);
    bluePoint.position.set(0.5, -0.87, 1.05);

    // ── Root group ────────────────────────────────────────────────────────────
    const root = new THREE.Group();
    root.scale.setScalar(isMobile ? 0.75 : 1.0); // Responsive scale for mobile screens
    scene.add(root);
    root.add(redCore);
    root.add(bluePoint);

    // Floor shadow receiver
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.ShadowMaterial({ opacity: 0.45 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.36;
    floor.receiveShadow = true;
    scene.add(floor);

    // Reflective surface
    const refl = new THREE.Mesh(
      new THREE.PlaneGeometry(3.5, 3.5),
      new THREE.MeshStandardMaterial({
        color: 0x07070a,
        roughness: 0.05,
        metalness: 1.0,
        envMapIntensity: 0.75,
      })
    );
    refl.rotation.x = -Math.PI / 2;
    refl.position.y = -1.37;
    scene.add(refl);

    // ── Shared materials ──────────────────────────────────────────────────────
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x16161c, roughness: 0.32, metalness: 0.78, envMapIntensity: 1.5,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0f, roughness: 0.18, metalness: 0.96, envMapIntensity: 2.0,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xb5801c, roughness: 0.08, metalness: 1.0, envMapIntensity: 3.2,
    });
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x092009, roughness: 0.85, metalness: 0.05,
    });
    const brightEdgeMat = new THREE.MeshStandardMaterial({
      color: 0x3d3d4e, roughness: 0.06, metalness: 1.0,
    });

    // ── BASE ──────────────────────────────────────────────────────────────────
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.56, 0.3, 2.56), bodyMat);
    slab.position.y = -1.09;
    slab.castShadow = true; slab.receiveShadow = true;
    root.add(slab);

    // Bottom bevel
    const bevel = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.065, 2.68), trimMat);
    bevel.position.y = -1.255;
    root.add(bevel);

    // Raised platform
    const plat = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.11, 1.88), trimMat);
    plat.position.y = -0.93;
    plat.castShadow = true; plat.receiveShadow = true;
    root.add(plat);

    // Platform highlight strip
    const highlightStrip = new THREE.Mesh(new THREE.BoxGeometry(1.91, 0.011, 1.91), brightEdgeMat);
    highlightStrip.position.set(0, -0.874, 0);
    root.add(highlightStrip);

    // Corner posts
    [[-1.15,-1.09,-1.15],[1.15,-1.09,-1.15],[-1.15,-1.09,1.15],[1.15,-1.09,1.15]].forEach(
      ([x,y,z]) => {
        const c = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.32,8), trimMat);
        c.position.set(x,y,z);
        root.add(c);
      }
    );

    // ── CONNECTOR PINS ────────────────────────────────────────────────────────
    const N = 15, SP = 0.115, OFF = -((N-1)*SP)/2;

    [-1.28, 1.28].forEach((xPos) => {
      // PCB backing
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, N*SP+0.04), pcbMat);
      pcb.position.set(xPos, -0.945, 0);
      root.add(pcb);

      for (let i = 0; i < N; i++) {
        const z = OFF + i * SP;
        // Pin shaft
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.21, 0.065), goldMat);
        pin.position.set(xPos, -0.945, z);
        pin.castShadow = true;
        root.add(pin);
        // Pin tip
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.05, 0.045), goldMat);
        tip.position.set(xPos, -0.835, z);
        root.add(tip);
        // Pin base pad
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.08), goldMat);
        pad.position.set(xPos, -1.06, z);
        root.add(pad);
      }
    });

    // ── LED ───────────────────────────────────────────────────────────────────
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x1144ff, emissive: 0x0022ff, emissiveIntensity: 6,
      roughness: 0, transparent: true, opacity: 0.9,
    });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.048, 20, 20), ledMat);
    led.position.set(0.52, -0.875, 1.02);
    root.add(led);
    // Housing ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.01, 8, 16),
      trimMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.52, -0.875, 1.04);
    root.add(ring);

    // ── GLASS CUBE ────────────────────────────────────────────────────────────
    const S = 1.74;
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xc0d4ef,
      transparent: true,
      opacity: 0.09,
      roughness: isMobile ? 0.1 : 0.0,
      metalness: 0.0,
      transmission: 0.94,
      thickness: isMobile ? 0.4 : 0.85,
      ior: 1.52,
      reflectivity: 1.0,
      envMapIntensity: 2.5,
      clearcoat: isMobile ? 0.5 : 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const glass = new THREE.Mesh(new THREE.BoxGeometry(S,S,S), glassMat);
    glass.position.y = 0.08;
    root.add(glass);

    // Inner glass shell (back-side for thickness illusion)
    const glassBk = new THREE.MeshPhysicalMaterial({
      color: 0x5566aa, transparent: true, opacity: 0.06,
      roughness: isMobile ? 0.05 : 0, 
      transmission: 0.96, 
      thickness: isMobile ? 0.15 : 0.3, 
      ior: 1.52,
      side: THREE.BackSide, depthWrite: false,
    });
    const glassInner = new THREE.Mesh(
      new THREE.BoxGeometry(S*0.984, S*0.984, S*0.984), glassBk
    );
    glassInner.position.y = 0.08;
    root.add(glassInner);

    // Bright white edges — most critical for glass read
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.55,
    });
    const glassEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(S,S,S)), edgeMat
    );
    glassEdges.position.y = 0.08;
    root.add(glassEdges);

    // Bevel tubes along vertical and horizontal edges
    const bevTubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, transparent: true, opacity: 0.16,
      roughness: 0, metalness: 0,
    });
    const H2 = S / 2;
    [[-H2,H2],[H2,H2],[-H2,-H2],[H2,-H2]].forEach(([ex,ez]) => {
      const e = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,S,6), bevTubeMat);
      e.position.set(ex, 0.08, ez);
      root.add(e);
    });
    [[-H2,H2],[H2,H2],[-H2,-H2],[H2,-H2]].forEach(([ey,ez]) => {
      const e = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,S,6), bevTubeMat);
      e.rotation.z = Math.PI/2;
      e.position.set(0, ey+0.08, ez);
      root.add(e);
    });

    // ── PHOTONIC NETWORK ──────────────────────────────────────────────────────
    const nodes: THREE.Vector3[] = [];
    const R = 0.63, em2 = R*0.82, im2 = R*0.44;

    for (const x of [-R,R]) for (const y of [-R,R]) for (const z of [-R,R])
      nodes.push(new THREE.Vector3(x, y+0.08, z));
    [[R,0,0],[-R,0,0],[0,R,0],[0,-R,0],[0,0,R],[0,0,-R]].forEach(
      ([x,y,z]) => nodes.push(new THREE.Vector3(x,y+0.08,z))
    );
    [[em2,em2,0],[em2,-em2,0],[-em2,em2,0],[-em2,-em2,0],
     [0,em2,em2],[0,em2,-em2],[0,-em2,em2],[0,-em2,-em2],
     [em2,0,em2],[em2,0,-em2],[-em2,0,em2],[-em2,0,-em2]].forEach(
      ([x,y,z]) => nodes.push(new THREE.Vector3(x,y+0.08,z))
    );
    [[im2,im2,im2],[im2,im2,-im2],[im2,-im2,im2],[-im2,im2,im2],
     [im2,-im2,-im2],[-im2,im2,-im2],[-im2,-im2,im2],[-im2,-im2,-im2]].forEach(
      ([x,y,z]) => nodes.push(new THREE.Vector3(x,y+0.08,z))
    );
    nodes.push(new THREE.Vector3(0,0.08,0));

    const lv: number[] = [];
    for (let i=0; i<nodes.length; i++)
      for (let j=i+1; j<nodes.length; j++)
        if (nodes[i].distanceTo(nodes[j]) < 1.12) {
          const a=nodes[i], b=nodes[j];
          lv.push(a.x,a.y,a.z, b.x,b.y,b.z);
        }
    const netGeo = new THREE.BufferGeometry();
    netGeo.setAttribute("position", new THREE.Float32BufferAttribute(lv,3));
    const netMat = new THREE.LineBasicMaterial({
      color: 0xff1535, transparent: true, opacity: 0.9,
    });
    root.add(new THREE.LineSegments(netGeo, netMat));

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xff1535, emissive: 0xff0520, emissiveIntensity: 4.5, roughness: 0,
    });
    nodes.forEach((p) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.016,8,8), nodeMat);
      s.position.copy(p);
      root.add(s);
    });

    // Glow sprite (additive soft bloom simulation)
    const glowC = document.createElement("canvas");
    glowC.width = 256; glowC.height = 256;
    const gctx = glowC.getContext("2d")!;
    const grd = gctx.createRadialGradient(128,128,0,128,128,128);
    grd.addColorStop(0,   "rgba(255,18,40,0.7)");
    grd.addColorStop(0.25,"rgba(255,10,30,0.3)");
    grd.addColorStop(0.6, "rgba(200,0,20,0.08)");
    grd.addColorStop(1,   "rgba(150,0,10,0)");
    gctx.fillStyle = grd;
    gctx.fillRect(0,0,256,256);
    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(glowC),
        blending: THREE.AdditiveBlending,
        transparent: true, opacity: 0.7, depthWrite: false,
      })
    );
    glowSprite.scale.set(2.8, 2.8, 1);
    glowSprite.position.set(0, 0.08, 0);
    root.add(glowSprite);

    // ── Label ─────────────────────────────────────────────────────────────────
    const lc = document.createElement("canvas");
    lc.width=512; lc.height=430;
    const lx = lc.getContext("2d")!;
    lx.clearRect(0,0,512,430);
    lx.fillStyle="rgba(255,255,255,0.80)";
    lx.font="bold 24px monospace"; lx.fillText("PHOTONIC CODE CENOTAPH",14,52);
    lx.font="22px monospace"; lx.fillText("// SECURE DATA VAULT 2066",14,86);
    lx.fillStyle="rgba(255,255,255,0.48)";
    lx.font="17px monospace";
    ["MODEL: PH-CEN-X1","TYPE: HIGH-SECURITY DATA ISOLATOR","INTEGRITY SEAL: VERIFIED"]
      .forEach((t,i) => lx.fillText(t,14,148+i*30));
    const lMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5,1.25),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(lc),
        transparent: true, opacity: 0.55, depthWrite: false,
      })
    );
    lMesh.position.set(0, 0.08, S/2+0.003);
    root.add(lMesh);

    // ── Orbit ─────────────────────────────────────────────────────────────────
    let dragging=false, lastX=0, lastY=0;
    let rotY=0.52, rotX=0.26, velY=0, velX=0;

    const onDown=(x:number,y:number)=>{ dragging=true; lastX=x; lastY=y; velY=0; velX=0; };
    const onMove=(x:number,y:number)=>{
      if(!dragging) return;
      velY=(x-lastX)*0.006; velX=(y-lastY)*0.003;
      rotY+=velY; rotX=Math.max(-0.52,Math.min(0.52,rotX+velX));
      lastX=x; lastY=y;
    };
    const onUp=()=>{ dragging=false; };

    const el=renderer.domElement;
    el.addEventListener("mousedown",(e)=>onDown(e.clientX,e.clientY));
    window.addEventListener("mousemove",(e)=>onMove(e.clientX,e.clientY));
    window.addEventListener("mouseup",onUp);
    el.addEventListener("touchstart",(e)=>onDown(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
    el.addEventListener("touchmove",(e)=>onMove(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
    el.addEventListener("touchend",onUp);

    // ── Interpolation and Animation Loop ───────────────────────────────────────
    let frameId:number, t=0;
    const AUTO = 0.0008;
    const targetPos = new THREE.Vector3(0.4, 1.25, 5.6);
    const targetLookAt = new THREE.Vector3(0, 0.1, 0);

    (function loop(){
      frameId=requestAnimationFrame(loop);
      t+=0.016;

      // Rotate group incrementally based on mouse dragging
      if(!dragging){
        velY=velY*0.93+AUTO;
        velX*=0.93;
        rotY+=velY;
        rotX=Math.max(-0.52,Math.min(0.52,rotX+velX));
      }
      root.rotation.y=rotY;
      root.rotation.x=rotX;

      // ── Camera scrollytelling transitions ──
      const p = scrollProgress ? scrollProgress.current : 0;
      const xShift = Math.min(W / 500, 1.25);

      const pos = new THREE.Vector3(0.4, 1.25, 5.6);
      const lookAt = new THREE.Vector3(0, 0.1, 0);

      if (p < 0.25) {
        // Section 1: Intro Hero Banner
        pos.set(xShift * 0.4, 1.25, 5.6);
        lookAt.set(0, 0.1, 0);
      } else if (p < 0.5) {
        // Section 2: Historical Context
        const tVal = (p - 0.25) / 0.25;
        const eased = tVal * tVal * (3 - 2 * tVal);
        pos.set(
          xShift * 0.4 - eased * (xShift * 1.65),
          1.25 - eased * 0.35,
          5.6 - eased * 1.6
        );
        lookAt.set(-eased * xShift * 0.15, 0.1, 0);
      } else if (p < 0.75) {
        // Section 3: Forensic Anatomy (Closer look at cube elements)
        const tVal = (p - 0.5) / 0.25;
        const eased = tVal * tVal * (3 - 2 * tVal);
        pos.set(
          -xShift * 1.25 + eased * (xShift * 1.55),
          0.9 + eased * 0.55,
          4.0 + eased * 1.2
        );
        lookAt.set(0, 0.15, 0);
      } else {
        // Section 4 & 5: Active stasis / Commercial
        const tVal = (p - 0.75) / 0.25;
        const eased = tVal * tVal * (3 - 2 * tVal);
        pos.set(
          xShift * 0.3 - eased * (xShift * 0.6),
          1.45 - eased * 0.75,
          5.2 + eased * 1.3
        );
        lookAt.set(0, 0.1, 0);
      }

      // Smooth camera interpolation using lerp
      targetPos.lerp(pos, 0.04);
      targetLookAt.lerp(lookAt, 0.04);

      camera.position.copy(targetPos);
      camera.lookAt(targetLookAt);

      // ── Dynamic stasis emission transitions based on scroll ──
      const currentEmission = emissionRef.current;
      const boost = currentEmission * 7.5;
      const pulse = 0.5 + Math.sin(t * 2.2) * 0.5;

      redCore.intensity = 2.0 + pulse * 3.0 + boost;
      netMat.opacity = 0.35 + (pulse * 0.30 + currentEmission * 0.55);
      nodeMat.emissiveIntensity = 2.5 + pulse * 2.5 + boost * 2.0;

      glowSprite.material.opacity = 0.22 + pulse * 0.32 + currentEmission * 0.40;
      ledMat.emissiveIntensity = 4 + Math.sin(t * (5.5 + currentEmission * 4)) * (1.5 + currentEmission * 2.5);

      // LED shifts from blue (standby) to blinking crimson (threat active)
      if (currentEmission > 0.1) {
        ledMat.color.setHex(0xff1133);
        ledMat.emissive.setHex(0xff0022);
        bluePoint.color.setHex(0xff1133);
      } else {
        ledMat.color.setHex(0x1144ff);
        ledMat.emissive.setHex(0x0022ff);
        bluePoint.color.setHex(0x1133ff);
      }

      bluePoint.intensity = 0.9 + Math.sin(t * (5.5 + currentEmission * 4)) * 0.4;
      edgeMat.opacity = 0.4 + pulse * 0.2;

      renderer.render(scene, camera);
    })();

    const onResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [scrollProgress]);

  return <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />;
}
