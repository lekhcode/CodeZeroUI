import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import * as THREE from "three";

export type AIInterviewerOrbState =
  | "idle"
  | "listening"
  | "thinking"
  | "analysing"
  | "analyzing"
  | "speaking"
  | "error";

type Props = {
  state?: AIInterviewerOrbState | string;
  /** Candidate mic level 0–1 (listening). */
  audioLevel?: number;
  /** AI playback level 0–1 (speaking). */
  outputLevel?: number;
  size?: number;
  className?: string;
  /** Approx point budget (structured curves, not a filled volume). */
  particleCount?: number;
};

type StateParams = {
  waveAmp: number;
  flow: number;
  brightness: number;
  radius: number;
  audioGain: number;
  bandShift: number;
};

const STATE: Record<string, StateParams> = {
  idle: { waveAmp: 0.055, flow: 0.42, brightness: 1.15, radius: 1.0, audioGain: 0, bandShift: 0 },
  listening: { waveAmp: 0.07, flow: 0.68, brightness: 1.25, radius: 1.02, audioGain: 0.35, bandShift: 0.15 },
  thinking: { waveAmp: 0.085, flow: 1.05, brightness: 1.28, radius: 0.995, audioGain: 0, bandShift: 0.35 },
  analysing: { waveAmp: 0.075, flow: 0.85, brightness: 1.22, radius: 1.01, audioGain: 0, bandShift: 0.5 },
  analyzing: { waveAmp: 0.075, flow: 0.85, brightness: 1.22, radius: 1.01, audioGain: 0, bandShift: 0.5 },
  speaking: { waveAmp: 0.09, flow: 0.8, brightness: 1.35, radius: 1.03, audioGain: 0.45, bandShift: 0.22 },
  error: { waveAmp: 0.025, flow: 0.18, brightness: 0.55, radius: 0.96, audioGain: 0, bandShift: 0 },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

const POINT_VERT = /* glsl */ `
uniform float uPointSize;
uniform float uTime;
uniform float uWaveAmp;
uniform float uFlow;
uniform float uRadius;
uniform float uAudio;
uniform float uBandShift;
uniform float uLayerPhase;
attribute float aCurve;
attribute float aAlong;
attribute float aShell;
attribute float aHalo;
varying float vDepth;
varying float vFacing;
varying float vY;
varying float vHalo;
varying float vAlong;

void main() {
  vAlong = aAlong;
  vHalo = aHalo;
  vec3 p = position;
  float t = uTime * (0.5 + uFlow * 0.4) + uLayerPhase;
  float ph = uLayerPhase * 1.4 + aCurve * 0.45 + aShell * 0.8;

  // Fluid ribbon deformation — smooth travelling waves, different phase per layer.
  float w1 = sin(aAlong * 7.5 + t * 1.55 + ph);
  float w2 = sin(aAlong * 4.2 - t * 1.05 + ph * 1.25);
  float w3 = sin(aAlong * 12.0 + t * 0.5 + aCurve * 0.2);
  float fold = sin(aAlong * 3.0 + t * 0.75 + uBandShift * 3.5 + ph);
  float lateral = (w1 * 0.5 + w2 * 0.35 + fold * 0.25) * uWaveAmp;
  float radial = 1.0
    + w3 * uWaveAmp * 0.42
    + fold * uWaveAmp * 0.18
    + uAudio * 0.05;

  vec3 n = normalize(p + vec3(0.0001));
  vec3 up = abs(n.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(n, up));
  vec3 bitangent = cross(n, tangent);

  float len = length(p);
  p = n * (len * radial * uRadius)
    + tangent * lateral * 0.65
    + bitangent * sin(aAlong * 5.5 + t + ph) * uWaveAmp * 0.4;
  p.y *= 1.0 + 0.04 * sin(t * 0.65 + ph);

  // Halo sparks drift slightly outward.
  if (aHalo > 0.5) {
    p *= 1.0 + 0.08 + 0.04 * sin(t * 1.2 + aCurve);
  }

  vY = clamp(p.y * 0.55 + 0.5, 0.0, 1.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vDepth = clamp((-mv.z - 0.55) / 2.4, 0.0, 1.0);
  vec3 viewN = normalize((modelViewMatrix * vec4(normalize(p), 0.0)).xyz);
  vFacing = viewN.z;
  gl_Position = projectionMatrix * mv;

  float atten = clamp(2.5 / max(0.001, -mv.z), 0.7, 1.45);
  float haloScale = aHalo > 0.5 ? 1.35 : 1.0;
  gl_PointSize = uPointSize * atten * haloScale;
}
`;

const POINT_FRAG = /* glsl */ `
precision mediump float;
uniform float uBrightness;
varying float vDepth;
varying float vFacing;
varying float vY;
varying float vHalo;
varying float vAlong;

vec3 ribbonGrad(float y, float along) {
  // Hot pink (top) → magenta → violet → electric blue (bottom)
  vec3 pink = vec3(1.00, 0.28, 0.72);
  vec3 magenta = vec3(0.95, 0.18, 0.92);
  vec3 violet = vec3(0.62, 0.28, 0.98);
  vec3 blue = vec3(0.22, 0.48, 1.00);
  vec3 col;
  if (y > 0.66) col = mix(magenta, pink, (y - 0.66) / 0.34);
  else if (y > 0.33) col = mix(violet, magenta, (y - 0.33) / 0.33);
  else col = mix(blue, violet, y / 0.33);
  // Subtle shimmer along strand
  col += vec3(0.08, 0.04, 0.1) * sin(along * 40.0);
  return col;
}

void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = dot(uv, uv);
  if (d > 1.0) discard;

  // Soft luminous core + restrained bloom fringe (not a blob).
  float core = exp(-d * 3.2);
  float bloom = exp(-d * 1.1) * 0.35;
  float glow = core + bloom;

  float front = clamp(vFacing * 0.5 + 0.5, 0.0, 1.0);
  // Stronger limb/back falloff → readable spherical volume + dark core.
  float shade = mix(0.18, 1.05, pow(front, 1.05));
  shade *= 0.45 + 0.55 * vDepth;

  vec3 col = ribbonGrad(vY, vAlong) * uBrightness * shade;
  float alpha = glow * shade * (vHalo > 0.5 ? 0.45 : 0.85);
  if (alpha < 0.03) discard;
  gl_FragColor = vec4(col * glow, alpha);
}
`;

type LayerSpec = {
  shells: number[];
  latBands: number;
  /** Parallel offset strands per band → mesh-ribbon look. */
  ribbonWidth: number;
  /** Vertical meridians so the form reads as a sphere, not stacked rings. */
  meridians: number;
  spirals: number;
  latBias: number;
  phase: number;
  spinY: number;
  spinX: number;
  spinZ: number;
  /** Initial Euler tilt (radians) — breaks flat face-on ring stack. */
  tilt: [number, number, number];
};

/**
 * Dense flowing ribbon mesh on spherical shells + sparse atmospheric halo.
 */
function buildRibbonGeometry(
  budget: number,
  spec: LayerSpec,
  haloCount: number,
): THREE.BufferGeometry {
  const { shells, latBands, ribbonWidth, meridians, spirals, latBias } = spec;
  const strandsPerBand = Math.max(1, ribbonWidth);
  const curvesPerShell = latBands * strandsPerBand + meridians + spirals;
  const samplesPerCurve = Math.min(
    140,
    Math.max(64, Math.floor(budget / Math.max(1, shells.length * curvesPerShell))),
  );

  const positions: number[] = [];
  const aCurve: number[] = [];
  const aAlong: number[] = [];
  const aShell: number[] = [];
  const aHalo: number[] = [];

  let curveId = 0;

  const push = (
    x: number,
    y: number,
    z: number,
    curve: number,
    along: number,
    shell: number,
    halo: number,
  ) => {
    positions.push(x, y, z);
    aCurve.push(curve);
    aAlong.push(along);
    aShell.push(shell);
    aHalo.push(halo);
  };

  for (let s = 0; s < shells.length; s++) {
    const R = shells[s]!;

    for (let b = 0; b < latBands; b++) {
      const u = (b + 0.5) / latBands;
      const phi0 = (0.18 + ((u + latBias) % 1) * 0.64) * Math.PI;

      for (let r = 0; r < strandsPerBand; r++) {
        const cid = curveId++;
        const strandOff = (r - (strandsPerBand - 1) * 0.5) * 0.028;
        for (let i = 0; i < samplesPerCurve; i++) {
          const along = i / samplesPerCurve;
          const theta = along * Math.PI * 2;
          // Organic rest undulation — folded silk ribbons.
          const wave =
            0.055 * Math.sin(theta * 2 + b * 0.9 + s) +
            0.035 * Math.sin(theta * 5 + latBias * 5 + r) +
            0.02 * Math.sin(theta * 9 + b);
          const phi = phi0 + strandOff + 0.02 * Math.sin(theta * 3 + r);
          const rr = R * (1 + wave);
          const x = rr * Math.sin(phi) * Math.cos(theta);
          const y = rr * Math.cos(phi);
          const z = rr * Math.sin(phi) * Math.sin(theta);
          push(x, y, z, cid, along, s, 0);
        }
      }
    }

    // Meridian arcs — wrap top→bottom so silhouette is spherical in perspective.
    for (let m = 0; m < meridians; m++) {
      const theta0 = (m / Math.max(1, meridians)) * Math.PI * 2 + latBias * 2;
      const cid = curveId++;
      for (let i = 0; i < samplesPerCurve; i++) {
        const along = i / (samplesPerCurve - 1);
        const phi = 0.16 * Math.PI + along * 0.68 * Math.PI;
        const twist = 0.12 * Math.sin(along * Math.PI * 2 + m + s);
        const theta = theta0 + twist;
        const rr = R * (1 + 0.03 * Math.sin(along * 6 + m));
        push(
          rr * Math.sin(phi) * Math.cos(theta),
          rr * Math.cos(phi),
          rr * Math.sin(phi) * Math.sin(theta),
          cid,
          along,
          s,
          0,
        );
      }
    }

    for (let sp = 0; sp < spirals; sp++) {
      const cid = curveId++;
      const turns = 1.6 + sp * 0.35;
      for (let i = 0; i < samplesPerCurve; i++) {
        const along = i / (samplesPerCurve - 1);
        const theta = along * Math.PI * 2 * turns + sp * 1.7 + latBias * 3;
        const phi = 0.24 * Math.PI + along * 0.55 * Math.PI;
        const rr = R * (1 + 0.04 * Math.sin(along * 8 + sp));
        push(
          rr * Math.sin(phi) * Math.cos(theta),
          rr * Math.cos(phi),
          rr * Math.sin(phi) * Math.sin(theta),
          cid,
          along,
          s,
          0,
        );
      }
    }
  }

  // Scattered atmospheric sparks just outside the silhouette.
  for (let h = 0; h < haloCount; h++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const rr = 1.12 + Math.random() * 0.22;
    push(
      rr * Math.sin(phi) * Math.cos(theta),
      rr * Math.cos(phi),
      rr * Math.sin(phi) * Math.sin(theta),
      curveId + h,
      u,
      0,
      1,
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("aCurve", new THREE.Float32BufferAttribute(aCurve, 1));
  geo.setAttribute("aAlong", new THREE.Float32BufferAttribute(aAlong, 1));
  geo.setAttribute("aShell", new THREE.Float32BufferAttribute(aShell, 1));
  geo.setAttribute("aHalo", new THREE.Float32BufferAttribute(aHalo, 1));
  return geo;
}

type LayerRuntime = {
  group: THREE.Group;
  uniforms: {
    uTime: { value: number };
    uPointSize: { value: number };
    uWaveAmp: { value: number };
    uFlow: { value: number };
    uRadius: { value: number };
    uAudio: { value: number };
    uBandShift: { value: number };
    uBrightness: { value: number };
    uLayerPhase: { value: number };
  };
  spinY: number;
  spinX: number;
  spinZ: number;
  geo: THREE.BufferGeometry;
  mat: THREE.ShaderMaterial;
};

/**
 * Luminous pink→violet→electric-blue particle energy field.
 * Dense curved mesh ribbons, hollow center, soft atmospheric glow.
 */
export function AIInterviewerOrb({
  state = "idle",
  audioLevel = 0,
  outputLevel,
  size = 120,
  className,
  particleCount,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const audioRef = useRef(audioLevel);
  const outputRef = useRef(outputLevel);
  stateRef.current = state;
  audioRef.current = audioLevel;
  outputRef.current = outputLevel;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      mount.textContent = "";
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(size, size, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    // Off-axis camera → clear spherical volume (not a flat stack of rings).
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0.85, 0.55, 2.85);
    camera.lookAt(0, 0, 0);

    const compact = size < 140;
    const totalBudget =
      particleCount ?? (reduced ? 2800 : compact ? 8500 : 15000);

    const layerSpecs: LayerSpec[] = [
      {
        shells: [0.9, 0.98],
        latBands: compact ? 6 : 7,
        ribbonWidth: compact ? 2 : 3,
        meridians: compact ? 5 : 6,
        spirals: 2,
        latBias: 0.0,
        phase: 0.15,
        spinY: 0.16,
        spinX: 0.06,
        spinZ: 0.025,
        tilt: [0.55, 0.2, 0.15],
      },
      {
        shells: [1.04],
        latBands: compact ? 6 : 8,
        ribbonWidth: compact ? 2 : 3,
        meridians: compact ? 4 : 5,
        spirals: 2,
        latBias: 0.33,
        phase: 2.05,
        spinY: -0.2,
        spinX: -0.08,
        spinZ: 0.035,
        tilt: [-0.4, 1.1, 0.55],
      },
      {
        shells: [1.12],
        latBands: compact ? 5 : 6,
        ribbonWidth: compact ? 2 : 2,
        meridians: compact ? 4 : 5,
        spirals: 1,
        latBias: 0.58,
        phase: 3.9,
        spinY: 0.11,
        spinX: 0.05,
        spinZ: -0.03,
        tilt: [0.25, -0.85, 1.0],
      },
    ];

    const root = new THREE.Group();
    // Slight pad so the silhouette reads as a free sphere, not a filled square tile.
    root.scale.setScalar(0.88);
    scene.add(root);

    const pointSize =
      Math.max(1.2, Math.min(compact ? 1.65 : 1.85, size * (compact ? 0.016 : 0.015))) * dpr;

    const layers: LayerRuntime[] = [];
    const shares = [0.36, 0.4, 0.24];
    const haloCounts = compact ? [40, 55, 30] : [80, 100, 60];

    for (let i = 0; i < layerSpecs.length; i++) {
      const spec = layerSpecs[i]!;
      const geo = buildRibbonGeometry(
        Math.floor(totalBudget * shares[i]!),
        spec,
        haloCounts[i]!,
      );

      const uniforms = {
        uTime: { value: 0 },
        uPointSize: { value: pointSize * (i === 0 ? 0.95 : 1) },
        uWaveAmp: { value: 0.055 },
        uFlow: { value: 0.42 },
        uRadius: { value: 1 },
        uAudio: { value: 0 },
        uBandShift: { value: 0 },
        uBrightness: { value: 1.2 },
        uLayerPhase: { value: spec.phase },
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const group = new THREE.Group();
      group.add(new THREE.Points(geo, mat));
      group.rotation.set(spec.tilt[0], spec.tilt[1], spec.tilt[2]);
      root.add(group);

      layers.push({
        group,
        uniforms,
        spinY: spec.spinY,
        spinX: spec.spinX,
        spinZ: spec.spinZ,
        geo,
        mat,
      });
    }

    let params = { ...STATE.idle! };
    let smoothAudio = 0;
    let raf = 0;
    let running = true;
    let visible = true;
    let t0 = performance.now();

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
      },
      { threshold: 0.05 },
    );
    io.observe(mount);

    const resize = () => {
      const box = mount.getBoundingClientRect();
      const w = Math.max(48, box.width || size);
      const h = Math.max(48, box.height || size);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const dt = Math.min(0.05, (now - t0) / 1000);
      t0 = now;

      const key = String(stateRef.current || "idle");
      const target = STATE[key] ?? STATE.idle!;
      const k = 1 - Math.exp(-dt * 3.2);
      params = {
        waveAmp: lerp(params.waveAmp, target.waveAmp, k),
        flow: lerp(params.flow, target.flow, k),
        brightness: lerp(params.brightness, target.brightness, k),
        radius: lerp(params.radius, target.radius, k),
        audioGain: lerp(params.audioGain, target.audioGain, k),
        bandShift: lerp(params.bandShift, target.bandShift, k),
      };

      const mic = clamp01(audioRef.current);
      const out =
        outputRef.current === undefined || outputRef.current === null
          ? null
          : clamp01(outputRef.current);
      const reactive =
        key === "listening"
          ? mic
          : key === "speaking"
            ? (out ?? 0.32 + 0.16 * Math.sin(now * 0.006))
            : 0;
      smoothAudio = lerp(smoothAudio, reactive, 1 - Math.exp(-dt * 7));

      const tSec = now * 0.001;
      for (const layer of layers) {
        layer.uniforms.uTime.value = tSec;
        layer.uniforms.uWaveAmp.value =
          params.waveAmp * (1 + smoothAudio * params.audioGain * 0.4);
        layer.uniforms.uFlow.value = params.flow;
        layer.uniforms.uRadius.value =
          params.radius * (1 + smoothAudio * params.audioGain * 0.02);
        layer.uniforms.uAudio.value = smoothAudio * params.audioGain;
        layer.uniforms.uBandShift.value = params.bandShift;
        layer.uniforms.uBrightness.value = params.brightness;

        if (!reduced) {
          const flowMul = 0.7 + params.flow * 0.5;
          layer.group.rotation.y += dt * layer.spinY * flowMul;
          layer.group.rotation.x += dt * layer.spinX * flowMul * 0.9;
          layer.group.rotation.z += dt * layer.spinZ * flowMul;
        }
      }

      if (!reduced) {
        root.rotation.y += dt * 0.06 * params.flow;
      }

      renderer.render(scene, camera);
    };

    if (reduced) {
      for (const layer of layers) layer.uniforms.uTime.value = 0;
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
      for (const layer of layers) {
        layer.geo.dispose();
        layer.mat.dispose();
      }
      renderer.dispose();
      mount.replaceChildren();
    };
  }, [size, particleCount]);

  return (
    <Box
      ref={mountRef}
      className={className}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        bgcolor: "transparent",
        border: "none",
        overflow: "visible",
        pointerEvents: "none",
        "& canvas": {
          display: "block",
          background: "transparent !important",
        },
      }}
      aria-hidden
    />
  );
}
