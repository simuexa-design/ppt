/**
 * ECG Guardian · Three.js 3D Cardiac Telemetry WebGL Stage
 * Renders a living 3D P-QRS-T waveform particle wave and ambient clinical depth field
 * that reacts smoothly as the user navigates across presentation slides.
 */

(function () {
  const canvas = document.getElementById('three-bg');
  if (!canvas || typeof THREE === 'undefined') return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x051916, 0.032);

  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 16);

  // Camera target state driven by slide changes
  const camTarget = { x: 0, y: 1.4, z: 16, rotZ: -0.05 };

  // Helper: authentic cardiac dipole waveform value y(phase in [0..1])
  function ecgMorphology(t) {
    const p = t % 1;
    // P wave
    const pWave = 0.25 * Math.exp(-Math.pow((p - 0.18) / 0.032, 2));
    // Q dip
    const qWave = -0.35 * Math.exp(-Math.pow((p - 0.31) / 0.014, 2));
    // R spike
    const rWave = 2.45 * Math.exp(-Math.pow((p - 0.34) / 0.015, 2));
    // S dip
    const sWave = -0.65 * Math.exp(-Math.pow((p - 0.37) / 0.016, 2));
    // T wave
    const tWave = 0.48 * Math.exp(-Math.pow((p - 0.54) / 0.045, 2));
    return pWave + qWave + rWave + sWave + tWave;
  }

  // 1. 3D ECG Particle Ribbon (multiple layered glowing trace lines)
  const ribbonPoints = 320;
  const ribbonRows = 5;
  const totalRibbonCount = ribbonPoints * ribbonRows;
  const ribbonPositions = new Float32Array(totalRibbonCount * 3);
  const ribbonColors = new Float32Array(totalRibbonCount * 3);

  const colGreen = new THREE.Color(0x19e68c);
  const colTeal = new THREE.Color(0x0f766e);
  const colWarm = new THREE.Color(0xf3ead8);

  for (let r = 0; r < ribbonRows; r++) {
    for (let i = 0; i < ribbonPoints; i++) {
      const idx = (r * ribbonPoints + i) * 3;
      const x = (i / (ribbonPoints - 1) - 0.5) * 38;
      const z = (r - 2) * 1.4 - 2.5;
      ribbonPositions[idx] = x;
      ribbonPositions[idx + 1] = -2.2;
      ribbonPositions[idx + 2] = z;

      const mix = r === 2 ? colGreen : r === 1 || r === 3 ? colTeal : colWarm;
      ribbonColors[idx] = mix.r;
      ribbonColors[idx + 1] = mix.g;
      ribbonColors[idx + 2] = mix.b;
    }
  }

  const ribbonGeo = new THREE.BufferGeometry();
  ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPositions, 3));
  ribbonGeo.setAttribute('color', new THREE.BufferAttribute(ribbonColors, 3));

  const ribbonMat = new THREE.PointsMaterial({
    size: 0.11,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const ribbonMesh = new THREE.Points(ribbonGeo, ribbonMat);
  scene.add(ribbonMesh);

  // 2. Ambient Floating Field Particles
  const dustCount = 220;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 44;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 0.08,
    color: 0x34d399,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const dustMesh = new THREE.Points(dustGeo, dustMat);
  scene.add(dustMesh);

  // Mouse parallax influence
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 1.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.9;
  }, { passive: true });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Expose slide camera choreography
  window.ThreeTelemetryStage = {
    setSlideTarget(slideIndex) {
      const presets = [
        { x: 0, y: 1.2, z: 15.5, rotZ: -0.05 },
        { x: 1.8, y: 2.0, z: 17.0, rotZ: 0.04 },
        { x: -1.6, y: 1.0, z: 16.2, rotZ: -0.03 },
        { x: 1.2, y: 0.8, z: 15.0, rotZ: 0.02 },
        { x: -1.2, y: 1.6, z: 15.8, rotZ: -0.04 },
        { x: 0.8, y: 2.2, z: 16.5, rotZ: 0.03 },
        { x: -1.5, y: 1.1, z: 15.4, rotZ: -0.02 },
        { x: 1.5, y: 1.4, z: 14.8, rotZ: 0.05 },
        { x: -0.9, y: 1.8, z: 16.0, rotZ: -0.03 },
        { x: 1.1, y: 1.2, z: 16.8, rotZ: 0.02 },
        { x: 0.0, y: 1.6, z: 14.5, rotZ: 0.0 }
      ];
      const p = presets[slideIndex % presets.length];
      camTarget.x = p.x;
      camTarget.y = p.y;
      camTarget.z = p.z;
      camTarget.rotZ = p.rotZ;
    }
  };

  let clockTime = 0;
  function animate() {
    requestAnimationFrame(animate);
    clockTime += 0.0045;

    const posAttr = ribbonGeo.attributes.position;
    const arr = posAttr.array;

    for (let r = 0; r < ribbonRows; r++) {
      const rowPhaseOffset = r * 0.14;
      const rowScale = r === 2 ? 1.0 : r === 1 || r === 3 ? 0.65 : 0.35;
      for (let i = 0; i < ribbonPoints; i++) {
        const idx = (r * ribbonPoints + i) * 3;
        const normX = i / (ribbonPoints - 1);
        const phase = (normX * 3.2 - clockTime + rowPhaseOffset + 10) % 1;
        const y = ecgMorphology(phase) * rowScale - 2.6 + Math.sin(normX * 6 + clockTime * 2) * 0.12;
        arr[idx + 1] = y;
      }
    }
    posAttr.needsUpdate = true;

    // Gentle drift of ambient particles
    dustMesh.rotation.y = clockTime * 0.12;
    dustMesh.rotation.x = Math.sin(clockTime * 0.5) * 0.04;

    // Smooth camera glide + subtle mouse parallax
    camera.position.x += (camTarget.x + mouseX - camera.position.x) * 0.045;
    camera.position.y += (camTarget.y - mouseY - camera.position.y) * 0.045;
    camera.position.z += (camTarget.z - camera.position.z) * 0.045;
    ribbonMesh.rotation.z += (camTarget.rotZ - ribbonMesh.rotation.z) * 0.04;
    camera.lookAt(0, 0, -2);

    renderer.render(scene, camera);
  }

  animate();
})();
