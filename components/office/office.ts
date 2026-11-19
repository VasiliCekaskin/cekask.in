import type * as T from "three";
import type { MottoId, OfficeThing } from "@/content/types";

/**
 * "Vasili's office": a small first-person scene built from boxes and canvas
 * textures, no model files. Walk around, look at things, use them. The
 * computer on the desk opens the motto picker (handled by React).
 */

export type Interactable = OfficeThing;

export type OfficeTexts = {
  board: string[];
  plate: string;
  os: string;
  screenHint: string;
  /** Name and role on the monitor. */
  statsLines: string[];
  stats: { label: string; value: number }[];
  footer: string;
  /** Glowing wall text in the dark, the calendar's circled note, the sticky note. */
  glow: string;
  calendarNote: string;
  note: string;
  locale: string;
};

export type OfficeCallbacks = {
  /** The object the player is looking at and close enough to use (null: none). */
  onPrompt: (target: Interactable | null) => void;
  /** `lightsOn`: the light switch's new state; `open`: the bathroom door's. */
  onInteract: (target: Interactable, state?: { lightsOn?: boolean; open?: boolean }) => void;
  /** The player walked into or out of the bathroom. */
  onRoom: (room: "office" | "bathroom") => void;
  /** Pointer lock was released (Esc) while playing. */
  onLockLost: () => void;
};

export type OfficeApi = {
  /** Starts or stops movement and input; the scene keeps rendering slowly when inactive. */
  setActive: (active: boolean) => void;
  /** Asks for pointer lock (desktop). Must be called from a user gesture. */
  lock: () => void;
  /** Uses whatever the player is looking at (the touch "use" button). */
  interact: () => void;
  /** Walking speed multiplier (the coffee rush). */
  setBoost: (multiplier: number) => void;
  /** Vasili's head in the shower bobs while he talks. */
  setTalking: (talking: boolean) => void;
  /** Restyles the office after a motto (colors, wall patterns, light). */
  setTheme: (motto: MottoId) => void;
  dispose: () => void;
};

type Box = { x0: number; x1: number; z0: number; z1: number };

const ROOM = { x: 6, z: 5, h: 3 };
const EYE = 1.62;
const RADIUS = 0.3;

function canvasTex(THREE: typeof T, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, ctx, canvas };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createOffice(
  THREE: typeof T,
  host: HTMLElement,
  texts: OfficeTexts,
  portraitSrc: string,
  cb: OfficeCallbacks,
): OfficeApi {
  const random = rng(42);
  // Phones and tablets: fewer pixels and a smaller shadow map, to keep it smooth.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: !coarse, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.3 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#cfe3ea");
  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 80);
  camera.rotation.order = "YXZ";

  const solids: Box[] = [];
  const targets: { kind: Interactable; pos: T.Vector3; reach: number }[] = [];
  /** Things you can only use from inside the bathroom (no reaching through walls). */
  const BATH_ONLY: Interactable[] = ["shower"];
  const disposables: { dispose: () => void }[] = [];
  const track = <D extends { dispose: () => void }>(d: D) => (disposables.push(d), d);

  const mat = (color: string, extra: Partial<T.MeshStandardMaterialParameters> = {}) =>
    track(new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra }));

  /** A box standing on y (bottom), centered on x/z. */
  const box = (
    w: number,
    h: number,
    d: number,
    material: T.Material,
    x: number,
    y: number,
    z: number,
    opts: { collide?: boolean; shadow?: boolean; parent?: T.Object3D } = {},
  ) => {
    const mesh = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), material);
    mesh.position.set(x, y + h / 2, z);
    if (opts.shadow !== false) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    (opts.parent ?? scene).add(mesh);
    if (opts.collide) solids.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    return mesh;
  };

  // ---- Lights: daylight through the window, ceiling panels, soft fill.
  const hemi = new THREE.HemisphereLight("#fff8ee", "#b9a891", 0.9);
  scene.add(hemi);
  const ceilingLights: T.PointLight[] = [];
  const ceilingPanels: T.MeshStandardMaterial[] = [];
  const sun = new THREE.DirectionalLight("#fff1dc", 2.4);
  sun.position.set(-12, 7, 1);
  sun.target.position.set(0, 0, -1);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(coarse ? 1024 : 2048);
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  for (const [x, z] of [
    [-2.5, -1.5],
    [2.5, -1.5],
    [0, 2.5],
  ]) {
    const light = new THREE.PointLight("#fff4e2", 6, 9, 1.6);
    light.position.set(x, ROOM.h - 0.25, z);
    scene.add(light);
    ceilingLights.push(light);
    const panel = mat("#ffffff", { emissive: "#fff6e8", emissiveIntensity: 1.4 });
    ceilingPanels.push(panel);
    box(1.2, 0.04, 0.6, panel, x, ROOM.h - 0.05, z, { shadow: false });
  }

  // ---- Room shell
  const planks = canvasTex(THREE, 512, 512, (c) => {
    const r = rng(3);
    for (let row = 0; row < 8; row++) {
      let x = -r() * 200;
      while (x < 512) {
        const len = 160 + r() * 200;
        const tone = 150 + r() * 40;
        c.fillStyle = `rgb(${tone + 20},${tone - 10},${tone - 55})`;
        c.fillRect(x, row * 64, len, 64);
        c.fillStyle = "rgba(60,35,15,0.35)";
        c.fillRect(x, row * 64, 2, 64);
        for (let g = 0; g < 6; g++) {
          c.fillStyle = `rgba(90,55,25,${0.05 + r() * 0.08})`;
          c.fillRect(x, row * 64 + r() * 64, len, 1 + r() * 2);
        }
        x += len;
      }
      c.fillStyle = "rgba(60,35,15,0.4)";
      c.fillRect(0, row * 64, 512, 2);
    }
  });
  planks.tex.wrapS = planks.tex.wrapT = THREE.RepeatWrapping;
  planks.tex.repeat.set(3, 3);
  track(planks.tex);
  const floor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(ROOM.x * 2, ROOM.z * 2)),
    mat("#ffffff", { map: planks.tex, roughness: 0.55 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = new THREE.Mesh(track(new THREE.PlaneGeometry(ROOM.x * 2, ROOM.z * 2)), mat("#f4f2ee"));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.h;
  scene.add(ceiling);

  const wallMat = mat("#ece7de", { roughness: 0.9 });
  const accentMat = mat("#3c5a47", { roughness: 0.9 });
  const T_ = 0.1;
  // Back wall (sage accent), front wall, right wall.
  box(ROOM.x * 2, ROOM.h, T_, accentMat, 0, 0, -ROOM.z - T_ / 2);
  // Front wall, with the doorway to the bathroom (x -2.8 … -1.6, 2.1 m high).
  const DOOR = { x0: -2.8, x1: -1.6, h: 2.1 };
  box(DOOR.x0 + ROOM.x, ROOM.h, T_, wallMat, (DOOR.x0 - ROOM.x) / 2, 0, ROOM.z + T_ / 2);
  box(ROOM.x - DOOR.x1, ROOM.h, T_, wallMat, (DOOR.x1 + ROOM.x) / 2, 0, ROOM.z + T_ / 2);
  box(DOOR.x1 - DOOR.x0, ROOM.h - DOOR.h, T_, wallMat, (DOOR.x0 + DOOR.x1) / 2, DOOR.h, ROOM.z + T_ / 2);
  box(T_, ROOM.h, ROOM.z * 2, wallMat, ROOM.x + T_ / 2, 0, 0);
  // Left wall with a wide window (z -3.2 … 1.2, y 0.9 … 2.5).
  const win = { z0: -3.2, z1: 1.2, y0: 0.9, y1: 2.5 };
  box(T_, win.y0, ROOM.z * 2, wallMat, -ROOM.x - T_ / 2, 0, 0);
  box(T_, ROOM.h - win.y1, ROOM.z * 2, wallMat, -ROOM.x - T_ / 2, win.y1, 0);
  box(T_, win.y1 - win.y0, win.z0 + ROOM.z, wallMat, -ROOM.x - T_ / 2, win.y0, (win.z0 - ROOM.z) / 2);
  box(T_, win.y1 - win.y0, ROOM.z - win.z1, wallMat, -ROOM.x - T_ / 2, win.y0, (win.z1 + ROOM.z) / 2);
  // Window frame and mullions
  const frameMat = mat("#2b2b2b", { roughness: 0.4 });
  const winMid = (win.z0 + win.z1) / 2;
  box(0.14, 0.06, win.z1 - win.z0, frameMat, -ROOM.x + 0.02, win.y0, winMid);
  box(0.14, 0.06, win.z1 - win.z0, frameMat, -ROOM.x + 0.02, win.y1 - 0.06, winMid);
  for (let i = 0; i <= 3; i++) {
    box(0.14, win.y1 - win.y0, 0.06, frameMat, -ROOM.x + 0.02, win.y0, win.z0 + ((win.z1 - win.z0) * i) / 3);
  }
  // The view: sky, a river-side skyline with a TV tower.
  const view = canvasTex(THREE, 1024, 512, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#7fb7e0");
    g.addColorStop(0.6, "#cfe6f2");
    g.addColorStop(1, "#f4efe4");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 512);
    const r = rng(9);
    c.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 6; i++) {
      const x = r() * 1024;
      const y = 40 + r() * 120;
      c.beginPath();
      c.ellipse(x, y, 60 + r() * 60, 14 + r() * 10, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#9fb3bf";
    for (let x = 0; x < 1024; ) {
      const w = 30 + r() * 60;
      const h = 60 + r() * 140;
      c.fillRect(x, 400 - h, w, h + 112);
      x += w + r() * 10;
    }
    // TV tower
    c.fillStyle = "#7d919d";
    c.fillRect(700, 110, 10, 300);
    c.beginPath();
    c.ellipse(705, 170, 22, 12, 0, 0, Math.PI * 2);
    c.fill();
    c.fillRect(703, 50, 4, 70);
    c.fillStyle = "#c2d6dd";
    c.fillRect(0, 440, 1024, 72);
  });
  track(view.tex);
  const viewPlane = new THREE.Mesh(
    track(new THREE.PlaneGeometry(14, 7)),
    track(new THREE.MeshBasicMaterial({ map: view.tex, color: "#ffffff" })),
  );
  viewPlane.position.set(-ROOM.x - 3, 1.7, winMid);
  viewPlane.rotation.y = Math.PI / 2;
  scene.add(viewPlane);

  // Skirting
  const skirt = mat("#d9d2c5");
  box(ROOM.x * 2, 0.08, 0.02, skirt, 0, 0, -ROOM.z + 0.01, { shadow: false });
  box(DOOR.x0 + ROOM.x, 0.08, 0.02, skirt, (DOOR.x0 - ROOM.x) / 2, 0, ROOM.z - 0.01, { shadow: false });
  box(ROOM.x - DOOR.x1, 0.08, 0.02, skirt, (DOOR.x1 + ROOM.x) / 2, 0, ROOM.z - 0.01, { shadow: false });
  box(0.02, 0.08, ROOM.z * 2, skirt, ROOM.x - 0.01, 0, 0, { shadow: false });

  // Rug
  const rug = new THREE.Mesh(
    track(new THREE.PlaneGeometry(4.2, 3)),
    mat("#b9775b", { roughness: 1 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, 0.6);
  rug.receiveShadow = true;
  scene.add(rug);

  // ---- Desk with the computer (back wall, center)
  const wood = mat("#a87b53", { roughness: 0.6 });
  const dark = mat("#2a2d30", { roughness: 0.5 });
  const metal = mat("#9aa1a6", { roughness: 0.35, metalness: 0.6 });
  const deskZ = -3.9;
  box(2, 0.05, 0.85, wood, 0, 0.72, deskZ, { collide: true });
  for (const sx of [-0.95, 0.95]) box(0.05, 0.72, 0.8, dark, sx, 0, deskZ);
  box(0.5, 0.55, 0.7, wood, 0.65, 0.15, deskZ); // drawers

  // Monitor
  box(0.06, 0.32, 0.05, metal, 0, 0.77, deskZ - 0.24);
  box(0.25, 0.015, 0.18, metal, 0, 0.77, deskZ - 0.2);
  box(0.9, 0.52, 0.04, dark, 0, 1.0, deskZ - 0.17);
  const screen = canvasTex(THREE, 640, 368, () => {});
  track(screen.tex);
  const screenMesh = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.84, 0.47)),
    track(new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })),
  );
  screenMesh.position.set(0, 1.26, deskZ - 0.145);
  scene.add(screenMesh);
  const screenGlow = new THREE.PointLight("#8fd3ff", 1.4, 2.2, 2);
  screenGlow.position.set(0, 1.25, deskZ + 0.2);
  scene.add(screenGlow);
  targets.push({ kind: "computer", pos: new THREE.Vector3(0, 1.25, deskZ), reach: 2.4 });

  const drawScreen = (blink: boolean) => {
    const c = screen.ctx;
    const g = c.createLinearGradient(0, 0, 640, 368);
    g.addColorStop(0, "#0f2a3d");
    g.addColorStop(1, "#1d4f5e");
    c.fillStyle = g;
    c.fillRect(0, 0, 640, 368);
    c.fillStyle = "rgba(255,255,255,0.08)";
    c.fillRect(0, 0, 640, 36);
    c.fillStyle = "#e9f7ff";
    c.font = "600 22px system-ui, sans-serif";
    c.fillText(texts.os, 18, 25);
    texts.statsLines.forEach((line, i) => {
      c.font = i === 0 ? "600 26px system-ui, sans-serif" : "18px system-ui, sans-serif";
      c.fillStyle = i === 0 ? "#ffffff" : "#bfe4f0";
      c.fillText(line, 28, 84 + i * 30);
    });
    texts.stats.slice(0, 4).forEach((s, i) => {
      const y = 150 + i * 34;
      c.font = "17px system-ui, sans-serif";
      c.fillStyle = "#d8f1f8";
      c.fillText(s.label, 28, y + 13);
      c.fillStyle = "rgba(255,255,255,0.15)";
      c.fillRect(250, y, 300, 14);
      c.fillStyle = "#6fe0a8";
      c.fillRect(250, y, (300 * s.value) / 100, 14);
      c.fillStyle = "#ffffff";
      c.fillText(String(s.value), 562, y + 13);
    });
    c.fillStyle = "#bfe4f0";
    c.font = "17px system-ui, sans-serif";
    c.fillText(texts.footer, 28, 300);
    c.fillStyle = "#ffd36b";
    c.font = "600 22px system-ui, sans-serif";
    c.fillText(`▶ ${texts.screenHint}${blink ? " _" : ""}`, 28, 342);
    screen.tex.needsUpdate = true;
  };
  drawScreen(true);

  // Keyboard, mug, name plate, lamp
  box(0.45, 0.02, 0.15, dark, -0.05, 0.77, deskZ + 0.2);
  box(0.07, 0.02, 0.1, dark, 0.3, 0.77, deskZ + 0.22);
  const mug = new THREE.Mesh(track(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16)), mat("#e9573f"));
  mug.position.set(-0.6, 0.82, deskZ + 0.15);
  mug.castShadow = true;
  scene.add(mug);
  const plate = canvasTex(THREE, 512, 96, (c) => {
    c.fillStyle = "#1f2a24";
    c.fillRect(0, 0, 512, 96);
    c.fillStyle = "#e8dcc0";
    c.font = "600 34px system-ui, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(texts.plate, 256, 50);
  });
  track(plate.tex);
  const plateMesh = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.5, 0.09, 0.03)),
    [dark, dark, dark, dark, track(new THREE.MeshStandardMaterial({ map: plate.tex })), dark],
  );
  plateMesh.position.set(0.55, 0.82, deskZ + 0.33);
  plateMesh.rotation.x = -0.35;
  scene.add(plateMesh);

  // Chair
  const chair = new THREE.Group();
  box(0.5, 0.08, 0.5, dark, 0, 0.45, 0, { parent: chair });
  box(0.5, 0.55, 0.06, dark, 0, 0.53, 0.24, { parent: chair });
  box(0.06, 0.45, 0.06, metal, 0, 0, 0, { parent: chair });
  box(0.55, 0.04, 0.08, metal, 0, 0.02, 0, { parent: chair });
  box(0.08, 0.04, 0.55, metal, 0, 0.02, 0, { parent: chair });
  chair.position.set(0.1, 0, deskZ + 0.85);
  chair.rotation.y = 0.25;
  scene.add(chair);
  solids.push({ x0: -0.2, x1: 0.4, z0: deskZ + 0.55, z1: deskZ + 1.15 });

  // ---- Whiteboard (back wall, left)
  const board = canvasTex(THREE, 768, 448, (c) => {
    c.fillStyle = "#fbfbf8";
    c.fillRect(0, 0, 768, 448);
    c.fillStyle = "#1e57c8";
    c.font = "bold 54px 'Marker Felt','Comic Sans MS','Segoe Print',cursive";
    c.fillText(texts.board[0] ?? "", 40, 80);
    c.font = "40px 'Marker Felt','Comic Sans MS','Segoe Print',cursive";
    texts.board.slice(1).forEach((line, i) => {
      c.fillStyle = i === texts.board.length - 2 ? "#d0342c" : "#26323c";
      c.fillText(line, 50, 150 + i * 70);
    });
  });
  track(board.tex);
  box(2.1, 1.25, 0.04, metal, -3.4, 1.05, -ROOM.z + 0.03);
  const boardFace = new THREE.Mesh(track(new THREE.PlaneGeometry(2.0, 1.15)), mat("#ffffff", { map: board.tex, roughness: 0.3 }));
  boardFace.position.set(-3.4, 1.675, -ROOM.z + 0.055);
  scene.add(boardFace);
  box(1.6, 0.03, 0.08, metal, -3.4, 1.0, -ROOM.z + 0.06);
  targets.push({ kind: "whiteboard", pos: new THREE.Vector3(-3.4, 1.6, -ROOM.z), reach: 3.2 });

  // ---- Portrait (back wall, right), face crop of the real photo
  box(0.82, 0.82, 0.04, mat("#1c1c1c"), 3.2, 1.25, -ROOM.z + 0.03);
  const photoTex = track(new THREE.TextureLoader().load(portraitSrc));
  photoTex.colorSpace = THREE.SRGBColorSpace;
  photoTex.repeat.set(0.46, 0.46);
  photoTex.offset.set(0.32, 0.53);
  const photo = new THREE.Mesh(track(new THREE.PlaneGeometry(0.68, 0.68)), mat("#ffffff", { map: photoTex, roughness: 0.4 }));
  photo.position.set(3.2, 1.66, -ROOM.z + 0.055);
  scene.add(photo);
  targets.push({ kind: "portrait", pos: new THREE.Vector3(3.2, 1.66, -ROOM.z), reach: 2.8 });

  // ---- Bookshelf (right wall)
  const shelfX = ROOM.x - 0.22;
  box(0.4, 2.2, 2.2, wood, shelfX, 0, -1.6, { collide: true });
  const bookColors = ["#c8553d", "#2d6a8f", "#e1b04a", "#3c5a47", "#7d4e7e", "#f2efe6", "#24323d"];
  for (let s = 0; s < 4; s++) {
    const y = 0.15 + s * 0.52;
    box(0.36, 0.03, 2.1, dark, shelfX - 0.03, y, -1.6, { shadow: false });
    let z = -2.6;
    while (z < -0.65) {
      const w = 0.04 + random() * 0.05;
      const h = 0.28 + random() * 0.16;
      const book = box(0.26, h, w, mat(bookColors[Math.floor(random() * bookColors.length)]), shelfX - 0.08, y + 0.03, z + w / 2, {
        shadow: false,
      });
      if (random() < 0.08) book.rotation.x = 0.25;
      z += w + 0.005;
      if (random() < 0.06) z += 0.2;
    }
  }

  // ---- Sideboard with coffee machine (right wall, front)
  box(0.5, 0.9, 1.4, wood, ROOM.x - 0.25, 0, 2.6, { collide: true });
  box(0.3, 0.4, 0.28, dark, ROOM.x - 0.3, 0.9, 2.4);
  box(0.06, 0.06, 0.06, metal, ROOM.x - 0.45, 1.12, 2.4);
  const cup = new THREE.Mesh(track(new THREE.CylinderGeometry(0.035, 0.03, 0.07, 14)), mat("#ffffff"));
  cup.position.set(ROOM.x - 0.45, 0.94, 2.4);
  scene.add(cup);
  const led = new THREE.Mesh(track(new THREE.SphereGeometry(0.012, 8, 8)), track(new THREE.MeshBasicMaterial({ color: "#4cff8a" })));
  led.position.set(ROOM.x - 0.44, 1.22, 2.3);
  scene.add(led);
  targets.push({ kind: "coffee", pos: new THREE.Vector3(ROOM.x - 0.3, 1.1, 2.4), reach: 2.2 });

  // ---- Sofa (left, front) facing the room
  const sofaMat = mat("#5d7d8c", { roughness: 0.95 });
  box(0.9, 0.42, 2.1, sofaMat, -ROOM.x + 0.55, 0, 3.1, { collide: true });
  box(0.25, 0.85, 2.1, sofaMat, -ROOM.x + 0.2, 0, 3.1);
  box(0.9, 0.62, 0.22, sofaMat, -ROOM.x + 0.55, 0, 2.05);
  box(0.9, 0.62, 0.22, sofaMat, -ROOM.x + 0.55, 0, 4.15);
  // Low table
  box(0.7, 0.04, 1.1, wood, -3.9, 0.38, 3.1, { collide: true });
  for (const [dx, dz] of [
    [-0.3, -0.5],
    [0.3, -0.5],
    [-0.3, 0.5],
    [0.3, 0.5],
  ])
    box(0.04, 0.38, 0.04, dark, -3.9 + dx, 0, 3.1 + dz);

  // ---- Plants
  const leafMat = mat("#3f8a4e", { roughness: 0.8 });
  const potMat = mat("#d8cfc0");
  const plant = (x: number, z: number, s: number, interactive = false) => {
    const pot = new THREE.Mesh(track(new THREE.CylinderGeometry(0.22 * s, 0.17 * s, 0.4 * s, 16)), potMat);
    pot.position.set(x, 0.2 * s, z);
    pot.castShadow = true;
    scene.add(pot);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(track(new THREE.SphereGeometry(0.18 * s, 10, 8)), leafMat);
      const a = (i / 9) * Math.PI * 2;
      const r = 0.12 * s + random() * 0.08 * s;
      leaf.position.set(x + Math.cos(a) * r, 0.5 * s + random() * 0.55 * s, z + Math.sin(a) * r);
      leaf.scale.set(1, 1.5, 0.6);
      leaf.rotation.set(random(), a, random());
      leaf.castShadow = true;
      scene.add(leaf);
    }
    solids.push({ x0: x - 0.25 * s, x1: x + 0.25 * s, z0: z - 0.25 * s, z1: z + 0.25 * s });
    if (interactive) targets.push({ kind: "plant", pos: new THREE.Vector3(x, 0.6 * s, z), reach: 2 });
  };
  plant(-1.75, -ROOM.z + 0.45, 1.3, true);
  plant(ROOM.x - 0.45, -ROOM.z + 0.45, 1.3);
  plant(-ROOM.x + 0.5, 1.7, 1);

  // ---- Door (front wall, right) and a wall clock
  const doorX = 3.6;
  box(1.1, 2.15, 0.06, mat("#7a5a3e", { roughness: 0.6 }), doorX, 0, ROOM.z - 0.03);
  box(1.24, 0.07, 0.08, mat("#e7e1d6"), doorX, 2.15, ROOM.z - 0.04);
  box(0.12, 0.03, 0.05, metal, doorX - 0.4, 1.0, ROOM.z - 0.08);
  targets.push({ kind: "door", pos: new THREE.Vector3(doorX, 1.1, ROOM.z), reach: 2.2 });

  const clock = canvasTex(THREE, 256, 256, () => {});
  track(clock.tex);
  const drawClock = () => {
    const c = clock.ctx;
    const now = new Date();
    c.clearRect(0, 0, 256, 256);
    c.fillStyle = "#fbfaf7";
    c.beginPath();
    c.arc(128, 128, 120, 0, Math.PI * 2);
    c.fill();
    c.lineWidth = 10;
    c.strokeStyle = "#222";
    c.stroke();
    c.fillStyle = "#222";
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.fillRect(128 + Math.sin(a) * 95 - 3, 128 - Math.cos(a) * 95 - 3, 6, 6);
    }
    const hand = (a: number, len: number, w: number, color = "#222") => {
      c.strokeStyle = color;
      c.lineWidth = w;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(128, 128);
      c.lineTo(128 + Math.sin(a) * len, 128 - Math.cos(a) * len);
      c.stroke();
    };
    const m = now.getMinutes() + now.getSeconds() / 60;
    hand(((now.getHours() % 12) + m / 60) * (Math.PI / 6), 55, 9);
    hand(m * (Math.PI / 30), 85, 6);
    hand(now.getSeconds() * (Math.PI / 30), 90, 2, "#d0342c");
    clock.tex.needsUpdate = true;
  };
  drawClock();
  const clockMesh = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.28, 32)),
    track(new THREE.MeshStandardMaterial({ map: clock.tex, transparent: true })),
  );
  clockMesh.position.set(0, 2.25, ROOM.z - 0.02);
  clockMesh.rotation.y = Math.PI;
  scene.add(clockMesh);


  // =====================================================================
  // Easter eggs
  // =====================================================================
  const anim: Record<string, number> = {}; // seconds left of each object's reaction
  const yellow = mat("#ffd23f", { roughness: 0.4 });

  // Rubber duck on the desk
  const duck = new THREE.Group();
  {
    const body = new THREE.Mesh(track(new THREE.SphereGeometry(0.06, 16, 12)), yellow);
    body.scale.set(1.25, 0.85, 1);
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.04, 16, 12)), yellow);
    head.position.set(0.045, 0.06, 0);
    const beak = new THREE.Mesh(track(new THREE.BoxGeometry(0.035, 0.012, 0.03)), mat("#ff8a1f"));
    beak.position.set(0.09, 0.055, 0);
    const eyeMat = mat("#111111");
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(track(new THREE.SphereGeometry(0.006, 8, 6)), eyeMat);
      eye.position.set(0.07, 0.075, 0.022 * s);
      duck.add(eye);
    }
    duck.add(body, head, beak);
    duck.traverse((o) => (o.castShadow = true));
  }
  duck.position.set(-0.35, 0.8, deskZ + 0.12);
  duck.rotation.y = -2.2;
  scene.add(duck);
  targets.push({ kind: "duck", pos: duck.position.clone(), reach: 1.8 });

  // Sticky note on the floor under the desk (the Konami code)
  const noteTex = canvasTex(THREE, 256, 256, (c) => {
    c.fillStyle = "#ffe95c";
    c.fillRect(0, 0, 256, 256);
    c.fillStyle = "#3a2f00";
    c.font = "bold 40px 'Marker Felt','Comic Sans MS',cursive";
    c.textAlign = "center";
    c.fillText(texts.note.slice(0, 4), 128, 110);
    c.fillText(texts.note.slice(4), 128, 170);
  });
  track(noteTex.tex);
  const noteMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(0.22, 0.22)), mat("#ffffff", { map: noteTex.tex }));
  noteMesh.rotation.set(-Math.PI / 2, 0, 0.3);
  noteMesh.position.set(-0.45, 0.003, deskZ - 0.1);
  scene.add(noteMesh);
  targets.push({ kind: "note", pos: noteMesh.position.clone(), reach: 3 });

  // Trash bin next to the desk, with crumpled drafts
  const bin = new THREE.Mesh(track(new THREE.CylinderGeometry(0.18, 0.15, 0.4, 20, 1, true)), mat("#8d969b", { side: THREE.DoubleSide, metalness: 0.4 }));
  bin.position.set(1.35, 0.2, deskZ - 0.1);
  bin.castShadow = true;
  scene.add(bin);
  const paper = mat("#f3f1ea", { flatShading: true });
  for (let i = 0; i < 4; i++) {
    const ball = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.06, 0)), paper);
    ball.position.set(1.35 + (random() - 0.5) * 0.15, 0.33 + random() * 0.08, deskZ - 0.1 + (random() - 0.5) * 0.15);
    scene.add(ball);
  }
  solids.push({ x0: 1.17, x1: 1.53, z0: deskZ - 0.28, z1: deskZ + 0.08 });
  targets.push({ kind: "trash", pos: new THREE.Vector3(1.35, 0.35, deskZ - 0.1), reach: 2 });

  // Server rack in the back-left corner, with blinking LEDs
  const rackX = -ROOM.x + 0.45;
  const rackZ = -ROOM.z + 0.5;
  box(0.7, 1.9, 0.8, mat("#1c1f22", { roughness: 0.4, metalness: 0.3 }), rackX, 0, rackZ, { collide: true });
  const leds: { mat: T.MeshBasicMaterial; phase: number }[] = [];
  for (let u = 0; u < 9; u++) {
    box(0.6, 0.15, 0.02, mat("#2b3034", { metalness: 0.4 }), rackX, 0.2 + u * 0.18, rackZ + 0.41, { shadow: false });
    for (let k = 0; k < 4; k++) {
      const m = track(new THREE.MeshBasicMaterial({ color: "#4cff8a" }));
      const led = new THREE.Mesh(track(new THREE.BoxGeometry(0.02, 0.02, 0.01)), m);
      led.position.set(rackX + 0.18 + k * 0.035, 0.28 + u * 0.18, rackZ + 0.425);
      scene.add(led);
      leds.push({ mat: m, phase: random() * 10 });
    }
  }
  const rackGlow = new THREE.PointLight("#4cff8a", 0.6, 2, 2);
  rackGlow.position.set(rackX + 0.3, 1, rackZ + 0.7);
  scene.add(rackGlow);
  targets.push({ kind: "rack", pos: new THREE.Vector3(rackX, 1.1, rackZ + 0.4), reach: 2.4 });

  // Wrench on the low table (his first trade)
  const wrench = new THREE.Group();
  {
    const steel = mat("#b8bec4", { metalness: 0.8, roughness: 0.3 });
    const handle = new THREE.Mesh(track(new THREE.BoxGeometry(0.32, 0.012, 0.035)), steel);
    const jaw = new THREE.Mesh(track(new THREE.TorusGeometry(0.035, 0.014, 8, 16, Math.PI * 1.4)), steel);
    jaw.rotation.x = Math.PI / 2;
    jaw.position.x = 0.18;
    const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.03, 0.012, 8, 16)), steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.x = -0.17;
    wrench.add(handle, jaw, ring);
    wrench.traverse((o) => (o.castShadow = true));
  }
  wrench.position.set(-3.9, 0.43, 2.9);
  wrench.rotation.y = 0.6;
  scene.add(wrench);
  targets.push({ kind: "wrench", pos: wrench.position.clone(), reach: 2.2 });

  // Trophy on the sideboard, next to the coffee machine
  const trophy = new THREE.Group();
  {
    const gold = mat("#e8b93a", { metalness: 0.9, roughness: 0.25 });
    const base = new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.05, 0.14)), mat("#3b2a1a"));
    base.position.y = 0.025;
    const stem = new THREE.Mesh(track(new THREE.CylinderGeometry(0.015, 0.025, 0.08, 12)), gold);
    stem.position.y = 0.09;
    const cupMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.035, 0.11, 20, 1, true)), track(new THREE.MeshStandardMaterial({ color: "#e8b93a", metalness: 0.9, roughness: 0.25, side: THREE.DoubleSide })));
    cupMesh.position.y = 0.185;
    const star = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.03)), gold);
    star.position.y = 0.27;
    trophy.add(base, stem, cupMesh, star);
    trophy.traverse((o) => (o.castShadow = true));
  }
  trophy.position.set(ROOM.x - 0.25, 0.9, 3.05);
  scene.add(trophy);
  targets.push({ kind: "trophy", pos: new THREE.Vector3(ROOM.x - 0.25, 1.05, 3.05), reach: 2.2 });

  // Guitar leaning against the front wall (TrackDemos)
  const guitar = new THREE.Group();
  {
    const bodyMat = mat("#b5502e", { roughness: 0.35 });
    const lower = new THREE.Mesh(track(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 28)), bodyMat);
    lower.rotation.x = Math.PI / 2;
    lower.position.y = 0.22;
    const upper = new THREE.Mesh(track(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 28)), bodyMat);
    upper.rotation.x = Math.PI / 2;
    upper.position.y = 0.48;
    const hole = new THREE.Mesh(track(new THREE.CircleGeometry(0.055, 20)), mat("#1a0f08"));
    hole.position.set(0, 0.36, 0.047);
    const neck = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.62, 0.035)), mat("#5a3a22"));
    neck.position.y = 0.92;
    const head = new THREE.Mesh(track(new THREE.BoxGeometry(0.09, 0.15, 0.04)), mat("#2a1a10"));
    head.position.y = 1.28;
    guitar.add(lower, upper, hole, neck, head);
    guitar.traverse((o) => (o.castShadow = true));
  }
  guitar.position.set(1.6, 0, ROOM.z - 0.25);
  guitar.rotation.set(-0.18, Math.PI, 0);
  scene.add(guitar);
  solids.push({ x0: 1.35, x1: 1.85, z0: ROOM.z - 0.5, z1: ROOM.z });
  targets.push({ kind: "guitar", pos: new THREE.Vector3(1.6, 0.6, ROOM.z - 0.3), reach: 2.2 });

  // Light switch next to the door
  box(0.09, 0.13, 0.015, mat("#f2efe8"), 2.85, 1.15, ROOM.z - 0.01, { shadow: false });
  const toggle = box(0.025, 0.045, 0.02, mat("#d8d3c9"), 2.85, 1.19, ROOM.z - 0.02, { shadow: false });
  targets.push({ kind: "light", pos: new THREE.Vector3(2.85, 1.2, ROOM.z), reach: 1.8 });

  // The glowing message on the back wall, visible in the dark
  const glowTex = canvasTex(THREE, 1024, 160, (c) => {
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = "bold 76px 'Marker Felt','Comic Sans MS',cursive";
    c.shadowColor = "#7dffb2";
    c.shadowBlur = 30;
    c.fillStyle = "#c9ffe0";
    c.fillText(texts.glow, 512, 84);
  });
  track(glowTex.tex);
  const glowMat = track(new THREE.MeshBasicMaterial({ map: glowTex.tex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
  const glowMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(3.2, 0.5)), glowMat);
  glowMesh.position.set(0, 2.45, -ROOM.z + 0.06);
  scene.add(glowMesh);

  // Wall calendar (right wall), today circled
  const calTex = canvasTex(THREE, 384, 448, (c) => {
    const now = new Date();
    const month = now.toLocaleDateString(texts.locale, { month: "long", year: "numeric" });
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, 384, 448);
    c.fillStyle = "#c8553d";
    c.fillRect(0, 0, 384, 70);
    c.fillStyle = "#ffffff";
    c.font = "600 32px system-ui, sans-serif";
    c.textAlign = "center";
    c.fillText(month, 192, 46);
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    c.font = "24px system-ui, sans-serif";
    for (let d = 1; d <= days; d++) {
      const i = d - 1 + offset;
      const x = 32 + (i % 7) * 53;
      const y = 115 + Math.floor(i / 7) * 52;
      c.fillStyle = i % 7 >= 5 ? "#c8553d" : "#26323c";
      c.fillText(String(d), x, y);
      if (d === now.getDate()) {
        c.strokeStyle = "#d0342c";
        c.lineWidth = 4;
        c.beginPath();
        c.ellipse(x, y - 8, 24, 20, -0.2, 0, Math.PI * 2);
        c.stroke();
      }
    }
    c.fillStyle = "#d0342c";
    c.font = "bold 28px 'Marker Felt','Comic Sans MS',cursive";
    c.fillText(texts.calendarNote, 192, 425);
  });
  track(calTex.tex);
  const calendar = new THREE.Mesh(track(new THREE.PlaneGeometry(0.55, 0.64)), mat("#ffffff", { map: calTex.tex, roughness: 0.8 }));
  calendar.position.set(ROOM.x - 0.02, 1.6, 0.9);
  calendar.rotation.y = -Math.PI / 2;
  scene.add(calendar);
  targets.push({ kind: "calendar", pos: calendar.position.clone(), reach: 2.4 });

  // Bug the cat, asleep on the sofa
  const cat = new THREE.Group();
  const catHead = new THREE.Group();
  const catTail = new THREE.Group();
  {
    const fur = mat("#e08a3c", { roughness: 0.95 });
    const body = new THREE.Mesh(track(new THREE.SphereGeometry(0.2, 18, 14)), fur);
    body.scale.set(1.5, 0.75, 1);
    body.position.y = 0.13;
    const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.11, 16, 12)), fur);
    catHead.add(head);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(track(new THREE.ConeGeometry(0.04, 0.08, 4)), fur);
      ear.position.set(0, 0.1, 0.05 * s);
      catHead.add(ear);
      const eye = new THREE.Mesh(track(new THREE.BoxGeometry(0.005, 0.006, 0.03)), mat("#3a2a1a"));
      eye.position.set(0.1, 0.02, 0.04 * s);
      catHead.add(eye);
    }
    catHead.position.set(0.3, 0.14, 0);
    const tail = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.02, 0.38, 8)), fur);
    tail.rotation.z = Math.PI / 2;
    tail.position.x = -0.19;
    catTail.add(tail);
    catTail.position.set(-0.27, 0.08, 0.05);
    cat.add(body, catHead, catTail);
    cat.traverse((o) => (o.castShadow = true));
  }
  cat.position.set(-ROOM.x + 0.6, 0.42, 3.5);
  cat.rotation.y = -0.4;
  scene.add(cat);
  targets.push({ kind: "cat", pos: new THREE.Vector3(-ROOM.x + 0.6, 0.6, 3.5), reach: 2.2 });

  // Lights on/off
  let lightsOn = true;
  const setLights = (on: boolean) => {
    lightsOn = on;
    const k = on ? 1 : 0.06;
    hemi.intensity = 0.9 * (on ? 1 : 0.12);
    sun.intensity = on ? 2.4 : 0.15;
    ceilingLights.forEach((l) => (l.intensity = 6 * k));
    ceilingPanels.forEach((m) => {
      m.emissiveIntensity = on ? 1.4 : 0;
      m.color.set(on ? "#ffffff" : "#3a3d40");
    });
    // Dark themes get a night view, too.
    const night = !on || new THREE.Color(theme.bg).getHSL({ h: 0, s: 0, l: 0 }).l < 0.2;
    (viewPlane.material as T.MeshBasicMaterial).color.set(night ? "#26304a" : "#ffffff");
    scene.background = new THREE.Color(on ? theme.bg : "#0d1322");
    toggle.position.y = on ? 1.19 + 0.0225 : 1.15 + 0.0225;
  };


  // =====================================================================
  // The bathroom (through the second door): Vasili is in the shower.
  // =====================================================================
  const BATH = { x0: -3.9, x1: -0.5, z0: ROOM.z + T_, z1: 8.3, h: 2.6 };
  const bathMidX = (BATH.x0 + BATH.x1) / 2;
  const bathMidZ = (BATH.z0 + BATH.z1) / 2;
  const bathW = BATH.x1 - BATH.x0;
  const bathD = BATH.z1 - BATH.z0;
  const tiles = canvasTex(THREE, 256, 256, (c) => {
    c.fillStyle = "#eaf4f6";
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = "#b9ccd1";
    c.lineWidth = 3;
    for (let i = 0; i <= 256; i += 64) {
      c.beginPath();
      c.moveTo(i, 0);
      c.lineTo(i, 256);
      c.moveTo(0, i);
      c.lineTo(256, i);
      c.stroke();
    }
  });
  tiles.tex.wrapS = tiles.tex.wrapT = THREE.RepeatWrapping;
  track(tiles.tex);
  const tileMat = (rx: number, ry: number) => {
    const t = tiles.tex.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    track(t);
    return mat("#ffffff", { map: t, roughness: 0.3 });
  };
  const bathFloor = new THREE.Mesh(track(new THREE.PlaneGeometry(bathW, bathD)), tileMat(bathW * 2.5, bathD * 2.5));
  bathFloor.rotation.x = -Math.PI / 2;
  bathFloor.position.set(bathMidX, 0.001, bathMidZ);
  bathFloor.receiveShadow = true;
  scene.add(bathFloor);
  const bathCeil = new THREE.Mesh(track(new THREE.PlaneGeometry(bathW, bathD)), mat("#f4f6f6"));
  bathCeil.rotation.x = Math.PI / 2;
  bathCeil.position.set(bathMidX, BATH.h, bathMidZ);
  scene.add(bathCeil);
  box(T_, BATH.h, bathD, tileMat(bathD * 1.5, BATH.h * 1.5), BATH.x0 - T_ / 2, 0, bathMidZ);
  box(T_, BATH.h, bathD, tileMat(bathD * 1.5, BATH.h * 1.5), BATH.x1 + T_ / 2, 0, bathMidZ);
  box(bathW + T_ * 2, BATH.h, T_, tileMat(bathW * 1.5, BATH.h * 1.5), bathMidX, 0, BATH.z1 + T_ / 2);
  // Bathroom side of the front wall: the office wall is only 3 m wide there, the bathroom is lower.
  box(bathW, ROOM.h - BATH.h, T_, wallMat, bathMidX, BATH.h, ROOM.z + T_ / 2, { shadow: false });
  const bathLight = new THREE.PointLight("#fff1dc", 5, 6, 1.6);
  bathLight.position.set(bathMidX, BATH.h - 0.2, bathMidZ);
  scene.add(bathLight);
  const lampMat = mat("#ffffff", { emissive: "#fff6e8", emissiveIntensity: 1.5 });
  const lamp = new THREE.Mesh(track(new THREE.CircleGeometry(0.25, 24)), lampMat);
  lamp.rotation.x = Math.PI / 2;
  lamp.position.set(bathMidX, BATH.h - 0.01, bathMidZ);
  scene.add(lamp);

  // Threshold under the doorway (the walls are 10 cm thick)
  box(DOOR.x1 - DOOR.x0, 0.01, T_ + 0.02, mat("#d9d2c5"), (DOOR.x0 + DOOR.x1) / 2, 0, ROOM.z + T_ / 2, { shadow: false });

  // Door (hinged on the left), opens into the bathroom
  const doorHinge = new THREE.Group();
  doorHinge.position.set(DOOR.x0, 0, ROOM.z + T_ / 2);
  box(DOOR.x1 - DOOR.x0 - 0.02, DOOR.h - 0.02, 0.05, mat("#f2efe8", { roughness: 0.6 }), (DOOR.x1 - DOOR.x0) / 2, 0, 0, { parent: doorHinge });
  const doorKnob = new THREE.Mesh(track(new THREE.SphereGeometry(0.035, 12, 10)), metal);
  doorKnob.position.set(DOOR.x1 - DOOR.x0 - 0.12, 1.0, -0.05);
  const doorKnob2 = doorKnob.clone();
  doorKnob2.position.z = 0.05;
  doorHinge.add(doorKnob, doorKnob2);
  // A sign on the office side
  const sign = canvasTex(THREE, 256, 128, (c) => {
    c.fillStyle = "#3c5a47";
    c.fillRect(0, 0, 256, 128);
    c.fillStyle = "#fff";
    c.font = "64px system-ui, sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("🚿", 128, 68);
  });
  track(sign.tex);
  const signMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(0.22, 0.11)), mat("#ffffff", { map: sign.tex }));
  signMesh.position.set((DOOR.x1 - DOOR.x0) / 2, 1.6, -0.03);
  signMesh.rotation.y = Math.PI;
  doorHinge.add(signMesh);
  scene.add(doorHinge);
  let bathOpen = false;
  let doorAngle = 0;
  targets.push({ kind: "bathroom", pos: new THREE.Vector3((DOOR.x0 + DOOR.x1) / 2, 1.45, ROOM.z), reach: 2.2 });

  // Sink with mirror and a towel (right wall)
  box(0.45, 0.85, 0.6, mat("#ffffff", { roughness: 0.25 }), BATH.x1 - 0.23, 0, 6.2, { collide: true });
  const bowl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.17, 0.12, 0.08, 20)), mat("#dfe8ea", { roughness: 0.2 }));
  bowl.position.set(BATH.x1 - 0.25, 0.86, 6.2);
  scene.add(bowl);
  box(0.03, 0.18, 0.03, metal, BATH.x1 - 0.06, 0.85, 6.2);
  const mirror = new THREE.Mesh(track(new THREE.PlaneGeometry(0.6, 0.75)), mat("#cfe6ee", { metalness: 0.9, roughness: 0.05 }));
  mirror.position.set(BATH.x1 - 0.01, 1.55, 6.2);
  mirror.rotation.y = -Math.PI / 2;
  scene.add(mirror);
  box(0.05, 0.6, 0.4, mat("#f08fb0", { roughness: 1 }), BATH.x1 - 0.04, 0.9, 7.1);
  const bathMat = new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 0.55)), mat("#8fc7d6", { roughness: 1 }));
  bathMat.rotation.x = -Math.PI / 2;
  bathMat.position.set(-2.1, 0.004, 6.75);
  scene.add(bathMat);

  // Shower corner (back left): tray, rail, a wavy curtain on two sides
  const SH = { x0: BATH.x0, x1: -2.45, z0: 6.95, z1: BATH.z1 };
  box(SH.x1 - SH.x0, 0.08, SH.z1 - SH.z0, mat("#ffffff", { roughness: 0.2 }), (SH.x0 + SH.x1) / 2, 0, (SH.z0 + SH.z1) / 2, { collide: true });
  box(SH.x1 - SH.x0, 0.03, 0.03, metal, (SH.x0 + SH.x1) / 2, 2.08, SH.z0, { shadow: false });
  box(0.03, 0.03, SH.z1 - SH.z0, metal, SH.x1, 2.08, (SH.z0 + SH.z1) / 2, { shadow: false });
  const curtainMat = mat("#7cc6d9", { roughness: 0.8, side: THREE.DoubleSide });
  const curtain = (length: number) => {
    const geo = new THREE.PlaneGeometry(length, 1.9, 40, 1);
    const pos = geo.attributes.position as T.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 18) * 0.035);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(track(geo), curtainMat);
    mesh.castShadow = true;
    return mesh;
  };
  // Front side, open a hand's width at the corner where he peeks out
  const front = curtain(SH.x1 - SH.x0 - 0.22);
  front.position.set(SH.x0 + (SH.x1 - SH.x0 - 0.22) / 2, 1.12, SH.z0);
  scene.add(front);
  // Below the shoulders the curtain is closed: the gap he peeks through is
  // only at head height (he holds it open with one hand).
  const flapGeo = new THREE.PlaneGeometry(0.26, 1.2, 8, 1);
  {
    const pos = flapGeo.attributes.position as T.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 18) * 0.03);
    flapGeo.computeVertexNormals();
  }
  const flap = new THREE.Mesh(track(flapGeo), curtainMat);
  flap.position.set(SH.x1 - 0.12, 0.17 + 0.6, SH.z0 - 0.005);
  flap.castShadow = true;
  scene.add(flap);
  const side = curtain(SH.z1 - SH.z0 - 0.05);
  side.rotation.y = Math.PI / 2;
  side.position.set(SH.x1, 1.12, SH.z0 + 0.05 + (SH.z1 - SH.z0 - 0.05) / 2);
  scene.add(side);
  // Shower head and pipe
  box(0.03, 0.9, 0.03, metal, -3.25, 1.3, SH.z1 - 0.05, { shadow: false });
  const showerHead = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.05, 0.05, 20)), metal);
  showerHead.position.set(-3.25, 2.18, SH.z1 - 0.2);
  showerHead.rotation.x = -0.5;
  scene.add(showerHead);
  // A rubber duck, of course
  const showerDuck = duck.clone();
  showerDuck.scale.setScalar(0.8);
  showerDuck.position.set(SH.x1 - 0.3, 0.13, SH.z0 + 0.25);
  showerDuck.rotation.y = 0.8;
  scene.add(showerDuck);

  // Vasili, in the shower. Everything below the shoulders stays behind the
  // curtain; the head, neck, one shoulder and arm lean out at the gap, and
  // his feet show under the hem.
  // A cute, cozy-game style Vasili: big round head, large glossy green eyes,
  // button nose, rosy cheeks, a happy open smile, a rounded light-brown hair
  // cap (wet, under shampoo foam) and a hint of goatee. No photo, just shapes.
  const skin = mat("#f2c6a5", { roughness: 0.75 });
  const hairMat = mat("#7b5636", { roughness: 0.45 });
  const R_HEAD = 0.15;

  const head = new THREE.Group();
  const skullMesh = new THREE.Mesh(track(new THREE.SphereGeometry(R_HEAD, 48, 36)), skin);
  skullMesh.scale.set(1, 0.93, 0.95);
  head.add(skullMesh);

  /** Puts a flat feature onto the face, sitting on the head's surface. */
  const onFace = (obj: T.Object3D, x: number, y: number, lift = 0.002) => {
    const zx = x / (R_HEAD * 1);
    const zy = y / (R_HEAD * 0.93);
    const z = Math.sqrt(Math.max(0, 1 - zx * zx - zy * zy)) * R_HEAD * 0.95;
    obj.position.set(x, y, z + lift);
    obj.rotation.set(-Math.asin(Math.min(0.9, zy)) * 0.9, Math.asin(Math.min(0.9, zx)) * 0.9, 0);
    head.add(obj);
    return obj;
  };

  // Hair: a rounded cap with a soft fringe, and short sideburns.
  const hairCap = new THREE.Mesh(track(new THREE.SphereGeometry(R_HEAD * 1.04, 40, 20, 0, Math.PI * 2, 0, 1.32)), hairMat);
  hairCap.scale.set(1, 0.95, 0.97);
  hairCap.rotation.x = -0.42;
  hairCap.position.set(0, 0.008, -0.006);
  head.add(hairCap);
  for (const fx of [-0.07, -0.025, 0.02, 0.065]) {
    const lock = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 14, 10)), hairMat);
    lock.scale.set(1.2, 0.7, 0.6);
    onFace(lock, fx, 0.095, -0.01);
  }
  for (const sx of [-1, 1]) {
    const burn = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.014, 0.035, 3, 8)), hairMat);
    burn.position.set(0.138 * sx, 0.02, 0.03);
    head.add(burn);
  }

  // Ears
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(track(new THREE.SphereGeometry(0.03, 14, 12)), skin);
    ear.scale.set(0.55, 0.9, 0.7);
    ear.position.set(0.148 * sx, -0.005, -0.005);
    head.add(ear);
  }

  // Eyes: big green ovals with a dark pupil and two white highlights. They
  // blink by squashing.
  const eyes: T.Group[] = [];
  const eyeGreen = mat("#3f9a5c", { roughness: 0.25 });
  const eyeDark = mat("#16301f", { roughness: 0.2 });
  const shine = track(new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  for (const sx of [-1, 1]) {
    const eye = new THREE.Group();
    const outer = new THREE.Mesh(track(new THREE.CircleGeometry(0.026, 28)), eyeDark);
    outer.scale.set(0.82, 1.05, 1);
    const irisDisc = new THREE.Mesh(track(new THREE.CircleGeometry(0.021, 28)), eyeGreen);
    irisDisc.scale.set(0.82, 1.05, 1);
    irisDisc.position.z = 0.0005;
    const pupilDisc = new THREE.Mesh(track(new THREE.CircleGeometry(0.011, 20)), eyeDark);
    pupilDisc.scale.set(0.82, 1.05, 1);
    pupilDisc.position.set(0, -0.002, 0.001);
    const hi1 = new THREE.Mesh(track(new THREE.CircleGeometry(0.0065, 14)), shine);
    hi1.position.set(0.006 * sx, 0.01, 0.0015);
    const hi2 = new THREE.Mesh(track(new THREE.CircleGeometry(0.003, 10)), shine);
    hi2.position.set(-0.007 * sx, -0.008, 0.0015);
    eye.add(outer, irisDisc, pupilDisc, hi1, hi2);
    onFace(eye, 0.05 * sx, 0.012);
    eyes.push(eye);
    // Brows: short, soft, a little raised (he's in a good mood)
    const brow = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.005, 0.022, 3, 8)), hairMat);
    brow.rotation.z = Math.PI / 2 + 0.12 * sx;
    const browWrap = new THREE.Group();
    browWrap.add(brow);
    onFace(browWrap, 0.05 * sx, 0.052, 0.004);
  }

  // Button nose and rosy cheeks
  const nose = new THREE.Mesh(track(new THREE.SphereGeometry(0.014, 16, 12)), mat("#eab094", { roughness: 0.7 }));
  nose.scale.set(1.15, 0.85, 0.8);
  onFace(nose, 0, -0.012, 0.004);
  const blushMat = track(new THREE.MeshBasicMaterial({ color: "#f59a9a", transparent: true, opacity: 0.45, depthWrite: false }));
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(track(new THREE.CircleGeometry(0.018, 20)), blushMat);
    cheek.scale.set(1.3, 0.8, 1);
    onFace(cheek, 0.082 * sx, -0.028, 0.001);
  }

  // Mouth: a happy open smile (a half disc) with a little tongue; it opens
  // wider while talking.
  const mouth = new THREE.Group();
  const mouthShape = new THREE.Mesh(track(new THREE.CircleGeometry(0.032, 28, Math.PI, Math.PI)), mat("#7a2f2c", { roughness: 0.6 }));
  mouthShape.scale.y = 0.75;
  const teethStrip = new THREE.Mesh(track(new THREE.PlaneGeometry(0.044, 0.006)), mat("#ffffff"));
  teethStrip.position.set(0, -0.003, 0.0005);
  const tongue = new THREE.Mesh(track(new THREE.CircleGeometry(0.014, 18, 0, Math.PI)), mat("#e0737a"));
  tongue.scale.y = 0.8;
  tongue.position.set(0, -0.024, 0.0005);
  mouth.add(mouthShape, teethStrip, tongue);
  onFace(mouth, 0, -0.045, 0.001);

  // A hint of his goatee
  const goatee = new THREE.Mesh(
    track(new THREE.CircleGeometry(0.014, 18)),
    track(new THREE.MeshBasicMaterial({ color: "#8a6648", transparent: true, opacity: 0.35, depthWrite: false })),
  );
  goatee.scale.set(1.2, 0.8, 1);
  onFace(goatee, 0, -0.085, 0.001);

  // Shampoo foam on the (wet) hair
  const foamMat = mat("#ffffff", { roughness: 0.3 });
  for (let i = 0; i < 12; i++) {
    const bubble = new THREE.Mesh(track(new THREE.SphereGeometry(0.025 + random() * 0.025, 14, 10)), foamMat);
    const a = (i / 12) * Math.PI * 2;
    bubble.position.set(Math.cos(a) * 0.07, 0.135 + random() * 0.03, Math.sin(a) * 0.06 - 0.015);
    head.add(bubble);
  }
  const HEAD = new THREE.Vector3(SH.x1 - 0.11, 1.66, SH.z0 - 0.06);
  head.position.copy(HEAD);
  head.traverse((o) => (o.castShadow = true));
  scene.add(head);

  /** A limb: a capsule stretched between two points. */
  const limbGeo = track(new THREE.CapsuleGeometry(1, 1, 4, 12));
  const limb = (radius: number) => {
    const m = new THREE.Mesh(limbGeo, skin);
    m.userData.radius = radius;
    m.castShadow = true;
    scene.add(m);
    return m;
  };
  const up = new THREE.Vector3(0, 1, 0);
  const span = new THREE.Vector3();

  const neck = limb(0.042);
  const upperArm = limb(0.035);
  const foreArm = limb(0.03);
  const hand = new THREE.Mesh(track(new THREE.SphereGeometry(0.042, 16, 12)), skin);
  hand.scale.set(0.95, 1, 0.75);
  hand.castShadow = true;
  scene.add(hand);
  const thumb = limb(0.014);
  const shoulder = new THREE.Mesh(track(new THREE.SphereGeometry(0.07, 18, 14)), skin);
  shoulder.scale.set(1.1, 0.75, 0.9);
  const SHOULDER = new THREE.Vector3(SH.x1 - 0.13, 1.44, SH.z0 + 0.07);
  shoulder.position.copy(SHOULDER);
  shoulder.castShadow = true;
  scene.add(shoulder);
  // The rest of the body, behind the curtain (only its shadow and edges show).
  const torso = new THREE.Mesh(track(new THREE.CapsuleGeometry(0.17, 0.5, 4, 16)), skin);
  torso.position.set(SH.x1 - 0.4, 0.95, SH.z0 + 0.4);
  torso.castShadow = true;
  scene.add(torso);
  // Feet and ankles poking out under the hem (the curtain ends at 0.17 m).
  const feet = [-0.62, -0.42].map((dx) => {
    const g = new THREE.Group();
    const foot = new THREE.Mesh(track(new THREE.SphereGeometry(0.05, 16, 12)), skin);
    foot.scale.set(0.85, 0.55, 1.25);
    foot.position.set(0, 0.03, -0.05);
    g.add(foot);
    const ankle = new THREE.Mesh(track(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 12)), skin);
    ankle.position.set(0, 0.11, 0.0);
    g.add(ankle);
    g.position.set(SH.x1 + dx, 0.08, SH.z0 + 0.1);
    g.traverse((o) => (o.castShadow = true));
    scene.add(g);
    return g;
  });

  targets.push({ kind: "shower", pos: HEAD.clone(), reach: 2.8 });
  let talking = false;
  const elbow = new THREE.Vector3();
  const handPos = new THREE.Vector3();
  const neckBase = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  /** Poses the figure each frame: looks at the player, holds the curtain, waves while talking. */
  const poseVasili = (t: number) => {
    const breathe = Math.sin(t * 1.6) * 0.006;
    head.position.set(
      HEAD.x + Math.sin(t * 0.9) * 0.015 + (talking ? 0.02 : 0),
      HEAD.y + breathe + (talking ? Math.abs(Math.sin(t * 10)) * 0.012 : 0),
      HEAD.z,
    );
    // Turn towards the player (the face points along +z of the head).
    toCam.subVectors(camera.position, head.position);
    const yaw = Math.atan2(toCam.x, toCam.z);
    const base = Math.PI * 1.08;
    let d = yaw - base;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    head.rotation.set(Math.sin(t * 0.7) * 0.05, base + Math.max(-0.8, Math.min(0.8, d)), Math.sin(t * 0.6) * 0.06);
    shoulder.position.set(SHOULDER.x, SHOULDER.y + breathe, SHOULDER.z);
    neckBase.set(head.position.x - 0.005, SHOULDER.y + 0.02, SH.z0 + 0.03);
    placeCapsule(neck, neckBase, new THREE.Vector3(head.position.x, head.position.y - 0.12, head.position.z + 0.03));
    // Hand: holds the curtain edge; while talking it comes up for a wave.
    const curtainEdge = SH.x0 + (SH.x1 - SH.x0 - 0.22);
    if (talking) {
      // Waves through the gap, next to his face.
      handPos.set(curtainEdge - 0.04 + Math.sin(t * 9) * 0.04, 1.76, SH.z0 - 0.08);
      elbow.set(curtainEdge + 0.04, 1.48, SH.z0 + 0.01);
    } else {
      // Arm behind the curtain; only the hand shows, holding its edge.
      handPos.set(curtainEdge + 0.005, 1.52 + breathe, SH.z0 - 0.012);
      elbow.set(SHOULDER.x - 0.06, 1.3, SH.z0 + 0.14);
    }
    placeCapsule(upperArm, shoulder.position, elbow);
    placeCapsule(foreArm, elbow, handPos);
    hand.position.copy(handPos);
    hand.rotation.set(0, 0.3, talking ? Math.sin(t * 9) * 0.4 : 0.2);
    placeCapsule(thumb, new THREE.Vector3(handPos.x + 0.02, handPos.y - 0.01, handPos.z - 0.02), new THREE.Vector3(handPos.x + 0.035, handPos.y + 0.03, handPos.z - 0.035));
    // Blink every few seconds; the mouth opens a little while talking.
    const blink = (t % 4.2) < 0.12 ? 1 : 0;
    eyes.forEach((e) => (e.scale.y = blink ? 0.12 : 1));
    mouth.scale.set(1, talking ? 0.7 + Math.abs(Math.sin(t * 10)) * 0.7 : 0.85, 1);
    // Wiggling toes, now and then.
    feet.forEach((f, i) => (f.rotation.x = Math.max(0, Math.sin(t * 2.2 + i * 2)) * 0.12));
  };
  const placeCapsule = (m: T.Mesh, a: T.Vector3, b: T.Vector3) => {
    span.subVectors(b, a);
    const len = span.length();
    const r = m.userData.radius as number;
    m.position.addVectors(a, b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(up, span.normalize());
    // The shared capsule is radius 1 with a straight part of 1 (3 tall in all):
    // scale x/z to the radius and y so it spans a → b. The caps get slightly
    // squashed, which reads fine for these short limbs.
    m.scale.set(r, Math.max(0.0001, len / 3), r);
  };

  // Steam rising in the shower
  const steamTex = canvasTex(THREE, 64, 64, (c) => {
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
  });
  track(steamTex.tex);
  const steam = Array.from({ length: 16 }, (_, i) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: steamTex.tex, transparent: true, opacity: 0.12, depthWrite: false })));
    s.userData = { x: SH.x0 + 0.2 + random() * (SH.x1 - SH.x0 - 0.2), z: SH.z0 + 0.1 + random() * (SH.z1 - SH.z0 - 0.2), t: i / 16 };
    scene.add(s);
    return s;
  });
  // Falling water
  const dropCount = 160;
  const dropPos = new Float32Array(dropCount * 3);
  for (let i = 0; i < dropCount; i++) {
    dropPos[i * 3] = -3.25 + (random() - 0.5) * 0.4;
    dropPos[i * 3 + 1] = random() * 2.1;
    dropPos[i * 3 + 2] = SH.z1 - 0.25 + (random() - 0.5) * 0.4;
  }
  const dropGeo = track(new THREE.BufferGeometry());
  dropGeo.setAttribute("position", new THREE.BufferAttribute(dropPos, 3));
  const drops = new THREE.Points(dropGeo, track(new THREE.PointsMaterial({ color: "#d8f2ff", size: 0.02, transparent: true, opacity: 0.8 })));
  scene.add(drops);


  // =====================================================================
  // Office themes: picking a motto on the computer restyles the room.
  // =====================================================================
  type Pattern = "dots" | "grid" | "news" | "lines" | "pixels" | "planks" | "bubbles" | "checker" | "stars";
  type Look = {
    wall: string;
    accent: string;
    floor: string;
    rug: string;
    sofa: string;
    ceiling: string;
    light: string;
    bg: string;
    /** Pattern on the side walls / on the back wall, drawn in `ink`. */
    wallPattern?: Pattern;
    accentPattern?: Pattern;
    ink?: string;
    /** Patterns that glow (the terminal). */
    glow?: boolean;
  };
  const LOOKS: Record<MottoId, Look> = {
    pro: { wall: "#ece7de", accent: "#3c5a47", floor: "#ffffff", rug: "#b9775b", sofa: "#5d7d8c", ceiling: "#f4f2ee", light: "#fff4e2", bg: "#cfe3ea" },
    clarity: { wall: "#1d2142", accent: "#0b0d1a", floor: "#6f7394", rug: "#b980f0", sofa: "#2a2350", ceiling: "#13162a", light: "#f9d976", bg: "#0b0d1a", accentPattern: "stars", wallPattern: "stars", ink: "#f9d976" },
    vibe: { wall: "#fff6e5", accent: "#ff3ea5", floor: "#ffe3f1", rug: "#9be15d", sofa: "#3a86ff", ceiling: "#fff0d6", light: "#fff0f8", bg: "#ffd6ec", wallPattern: "dots", accentPattern: "dots", ink: "#ffb3d9" },
    terminal: { wall: "#0d120c", accent: "#090c08", floor: "#3b4a38", rug: "#1f3b1a", sofa: "#1a2a18", ceiling: "#0d120c", light: "#b6f5a3", bg: "#050805", wallPattern: "grid", accentPattern: "grid", ink: "#3aff6a", glow: true },
    paper: { wall: "#ebe5d6", accent: "#f5f0e3", floor: "#d8d0bd", rug: "#c8102e", sofa: "#141414", ceiling: "#f5f0e3", light: "#fff8ec", bg: "#e8e2d2", wallPattern: "news", accentPattern: "news", ink: "#3a3a3a" },
    receipt: { wall: "#fffefa", accent: "#c9cfd3", floor: "#c9cfd3", rug: "#26282a", sofa: "#5f6a72", ceiling: "#fffefa", light: "#ffffff", bg: "#e9ecee", wallPattern: "lines", ink: "#c9cdd0" },
    rpg: { wall: "#2a2147", accent: "#1b1530", floor: "#6a5a8a", rug: "#ff5c7a", sofa: "#ffcc33", ceiling: "#1b1530", light: "#ffcc33", bg: "#1b1530", wallPattern: "pixels", accentPattern: "pixels", ink: "#3b2f63" },
    wanted: { wall: "#8a5a32", accent: "#5a3a22", floor: "#c79a6a", rug: "#e8b04a", sofa: "#3b2412", ceiling: "#6b4528", light: "#ffd59a", bg: "#e8c99a", wallPattern: "planks", accentPattern: "planks", ink: "#4a2d16" },
    chat: { wall: "#dfe9f3", accent: "#1f7aec", floor: "#eef3f8", rug: "#1f7aec", sofa: "#ffffff", ceiling: "#ffffff", light: "#f0f6ff", bg: "#dfe9f3", accentPattern: "bubbles", ink: "#ffffff" },
    recipe: { wall: "#f4ece0", accent: "#b5402f", floor: "#f0e2cc", rug: "#b5402f", sofa: "#fffaf1", ceiling: "#fffaf1", light: "#fff1dc", bg: "#f4ece0", wallPattern: "checker", ink: "#e9b3a8" },
    boarding: { wall: "#ffffff", accent: "#0f3b6e", floor: "#c9d6e2", rug: "#e8590c", sofa: "#0f3b6e", ceiling: "#f4f7fa", light: "#f4f8ff", bg: "#8fb8e0", accentPattern: "dots", ink: "#1d5596" },
    ai: { wall: "#ffffff", accent: "#f2f2f2", floor: "#f0f0f0", rug: "#0d0d0d", sofa: "#e3e3e3", ceiling: "#ffffff", light: "#ffffff", bg: "#f7f7f7" },
  };
  let theme = LOOKS.pro;

  const patternCache = new Map<string, T.CanvasTexture>();
  const patternTex = (pattern: Pattern, base: string, ink: string) => {
    const key = `${pattern}|${base}|${ink}`;
    const hit = patternCache.get(key);
    if (hit) return hit;
    const r = rng(pattern.length * 97);
    const { tex } = canvasTex(THREE, 256, 256, (c) => {
      c.fillStyle = base;
      c.fillRect(0, 0, 256, 256);
      c.fillStyle = ink;
      c.strokeStyle = ink;
      switch (pattern) {
        case "dots":
          for (let y = 0; y < 256; y += 32)
            for (let x = (y / 32) % 2 ? 16 : 0; x < 256; x += 32) {
              c.beginPath();
              c.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
              c.fill();
            }
          break;
        case "grid":
          c.lineWidth = 2;
          for (let i = 0; i <= 256; i += 32) {
            c.beginPath();
            c.moveTo(i, 0);
            c.lineTo(i, 256);
            c.moveTo(0, i);
            c.lineTo(256, i);
            c.stroke();
          }
          c.font = "14px monospace";
          for (let i = 0; i < 6; i++) c.fillText(r() > 0.5 ? "0101" : "> _", 8 + r() * 200, 20 + r() * 230);
          break;
        case "news":
          for (let col = 0; col < 3; col++) {
            const x = 10 + col * 82;
            c.fillRect(x, 14, 72, 10);
            for (let y = 34; y < 246; y += 7) c.fillRect(x, y, 72 - (r() < 0.15 ? 30 : 0), 3);
          }
          break;
        case "lines":
          for (let y = 8; y < 256; y += 16) c.fillRect(0, y, 256, 1);
          break;
        case "pixels":
          for (let y = 0; y < 256; y += 16) for (let x = 0; x < 256; x += 16) if (r() < 0.25) c.fillRect(x, y, 16, 16);
          break;
        case "planks":
          for (let x = 0; x < 256; x += 32) {
            c.fillRect(x, 0, 2, 256);
            c.globalAlpha = 0.25;
            for (let g = 0; g < 5; g++) c.fillRect(x + 4 + r() * 24, 0, 1, 256);
            c.globalAlpha = 1;
          }
          break;
        case "bubbles":
          for (let i = 0; i < 6; i++) {
            const x = 10 + r() * 170;
            const y = 10 + r() * 210;
            c.beginPath();
            c.roundRect(x, y, 60 + r() * 20, 26, 12);
            c.fill();
          }
          break;
        case "checker":
          for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) if ((x + y) % 64 === 0) c.fillRect(x, y, 32, 32);
          break;
        case "stars":
          for (let i = 0; i < 40; i++) {
            c.globalAlpha = 0.4 + r() * 0.6;
            c.beginPath();
            c.arc(r() * 256, r() * 256, 0.8 + r() * 1.8, 0, Math.PI * 2);
            c.fill();
          }
          c.globalAlpha = 1;
          break;
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1.2);
    track(tex);
    patternCache.set(key, tex);
    return tex;
  };

  const paint = (m: T.MeshStandardMaterial, color: string, pattern: Pattern | undefined, ink: string | undefined, glow: boolean) => {
    if (pattern && ink) {
      const tex = patternTex(pattern, color, ink);
      m.map = tex;
      m.color.set("#ffffff");
      m.emissiveMap = glow ? tex : null;
      m.emissive.set(glow ? "#3aff6a" : "#000000");
      m.emissiveIntensity = glow ? 0.35 : 1;
    } else {
      m.map = null;
      m.emissiveMap = null;
      m.color.set(color);
      m.emissive.set("#000000");
    }
    m.needsUpdate = true;
  };

  const applyTheme = (id: MottoId) => {
    theme = LOOKS[id];
    paint(wallMat, theme.wall, theme.wallPattern, theme.ink, !!theme.glow);
    paint(accentMat, theme.accent, theme.accentPattern, theme.ink, !!theme.glow);
    (floor.material as T.MeshStandardMaterial).color.set(theme.floor);
    (rug.material as T.MeshStandardMaterial).color.set(theme.rug);
    sofaMat.color.set(theme.sofa);
    (ceiling.material as T.MeshStandardMaterial).color.set(theme.ceiling);
    ceilingLights.forEach((l) => l.color.set(theme.light));
    ceilingPanels.forEach((m) => m.emissive.set(theme.light));
    hemi.color.set(theme.light);
    setLights(lightsOn);
  };

  /** Reactions that happen in the scene right away when something is used. */
  const react = (kind: Interactable) => {
    if (kind === "light") setLights(!lightsOn);
    if (kind === "bathroom") bathOpen = !bathOpen;
    anim[kind] = kind === "rack" ? 2 : kind === "cat" ? 2.5 : 1;
  };

  // ---- Player
  const player = { x: 1.2, z: 3.6, yaw: 0.25, pitch: -0.05, bob: 0 };
  const keys = new Set<string>();
  let active = false;
  let locked = false;
  let prompt: Interactable | null = null;
  const move = { x: 0, y: 0 }; // touch joystick, -1 … 1
  const el = renderer.domElement;
  // Pointer lock can be refused (iframes, unfocused windows); drag-to-look still works then.
  const requestLock = () => {
    try {
      const r = el.requestPointerLock?.() as Promise<void> | undefined;
      r?.catch?.(() => {});
    } catch {}
  };

  /** Where the player may stand: the office, the bathroom, and the doorway while the door is open. */
  const walkable = (x: number, z: number) => {
    const inRect = (x0: number, x1: number, z0: number, z1: number, r: number) => x > x0 + r && x < x1 - r && z > z0 + r && z < z1 - r;
    return (
      inRect(-ROOM.x, ROOM.x, -ROOM.z, ROOM.z, RADIUS) ||
      inRect(BATH.x0, BATH.x1, BATH.z0, BATH.z1, RADIUS) ||
      (bathOpen && doorAngle < -1 && inRect(DOOR.x0, DOOR.x1, ROOM.z - 0.6, BATH.z0 + 0.6, RADIUS * 0.3))
    );
  };
  const blocked = (x: number, z: number) =>
    solids.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS);

  const look = (dx: number, dy: number, scale: number) => {
    player.yaw -= dx * scale;
    player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - dy * scale));
  };

  const activate = (kind: Interactable) => {
    react(kind);
    cb.onInteract(kind, kind === "light" ? { lightsOn } : kind === "bathroom" ? { open: bathOpen } : undefined);
  };
  let boost = 1;
  let wasInBath = false;

  const onKey = (e: KeyboardEvent) => {
    if (!active) return;
    const k = e.key.toLowerCase();
    if (e.type === "keydown") {
      if ((k === "e" || k === "enter") && prompt) {
        e.preventDefault();
        activate(prompt);
        return;
      }
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) {
        keys.add(k);
        if (k.startsWith("arrow")) e.preventDefault();
      }
    } else keys.delete(k);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (active && locked) look(e.movementX, e.movementY, 0.0022);
  };
  const onLockChange = () => {
    locked = document.pointerLockElement === el;
    if (!locked && active) cb.onLockLost();
  };

  // A visible joystick under the left thumb (touch only).
  const STICK = 50;
  const stick = document.createElement("div");
  const knob = document.createElement("div");
  Object.assign(stick.style, {
    position: "absolute",
    width: `${STICK * 2 + 10}px`,
    height: `${STICK * 2 + 10}px`,
    marginLeft: `${-(STICK + 5)}px`,
    marginTop: `${-(STICK + 5)}px`,
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.55)",
    background: "rgba(20,25,22,0.25)",
    pointerEvents: "none",
    display: "none",
  });
  Object.assign(knob.style, {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: "46px",
    height: "46px",
    margin: "-23px 0 0 -23px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.8)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  });
  stick.setAttribute("aria-hidden", "true");
  stick.appendChild(knob);
  host.appendChild(stick);

  // Touch and non-locked mouse: drag on the right to look, on the left to walk.
  const drags = new Map<number, { kind: "move" | "look"; x: number; y: number; ox: number; oy: number }>();
  const onDown = (e: PointerEvent) => {
    if (!active) return;
    if (e.pointerType === "mouse") {
      if (!locked) requestLock();
      // Still allow drag-to-look in case pointer lock is unavailable.
      drags.set(e.pointerId, { kind: "look", x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY });
      return;
    }
    const r = el.getBoundingClientRect();
    const kind = e.clientX - r.left < r.width * 0.45 ? "move" : "look";
    // One thumb per job: ignore a second finger on the same side.
    if ([...drags.values()].some((d) => d.kind === kind)) return;
    drags.set(e.pointerId, { kind, x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY });
    el.setPointerCapture(e.pointerId);
    if (kind === "move") {
      stick.style.left = `${e.clientX - r.left}px`;
      stick.style.top = `${e.clientY - r.top}px`;
      knob.style.transform = "";
      stick.style.display = "block";
    }
  };
  const onMove = (e: PointerEvent) => {
    const d = drags.get(e.pointerId);
    if (!d || !active) return;
    if (d.kind === "look") {
      if (!locked) look(e.clientX - d.x, e.clientY - d.y, e.pointerType === "mouse" ? 0.004 : 0.006);
    } else {
      let dx = e.clientX - d.ox;
      let dy = e.clientY - d.oy;
      const len = Math.hypot(dx, dy);
      if (len > STICK) {
        dx = (dx / len) * STICK;
        dy = (dy / len) * STICK;
      }
      move.x = dx / STICK;
      move.y = dy / STICK;
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onUp = (e: PointerEvent) => {
    const d = drags.get(e.pointerId);
    drags.delete(e.pointerId);
    if (d?.kind === "move") {
      move.x = move.y = 0;
      stick.style.display = "none";
    }
    // A quick tap (touch) on something usable uses it.
    if (d && e.pointerType !== "mouse" && Math.hypot(e.clientX - d.ox, e.clientY - d.oy) < 8 && prompt) activate(prompt);
  };

  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("pointerlockchange", onLockChange);
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.style.touchAction = "none";

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.8 ? 80 : 70;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // ---- Loop
  let raf = 0;
  let last = performance.now();
  let clockTimer = 0;
  let blinkTimer = 0;
  let blink = true;
  const forward = new THREE.Vector3();
  const toTarget = new THREE.Vector3();

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const stamp = performance.now();
    const dt = Math.min((stamp - last) / 1000, 0.05);
    last = stamp;

    if (active) {
      let fx = 0;
      let fz = 0;
      if (keys.has("w") || keys.has("arrowup")) fz += 1;
      if (keys.has("s") || keys.has("arrowdown")) fz -= 1;
      if (keys.has("a")) fx -= 1;
      if (keys.has("d")) fx += 1;
      if (keys.has("arrowleft")) player.yaw += dt * 2;
      if (keys.has("arrowright")) player.yaw -= dt * 2;
      fx += move.x;
      fz -= move.y;
      const len = Math.hypot(fx, fz);
      if (len > 0.01) {
        const run = keys.has("shift") || Math.hypot(move.x, move.y) > 0.95;
        const speed = (run ? 4.2 : 2.4) * boost * Math.min(1, len) * dt;
        fx /= len;
        fz /= len;
        const sin = Math.sin(player.yaw);
        const cos = Math.cos(player.yaw);
        const dx = (fx * cos - fz * sin) * speed;
        const dz = (-fx * sin - fz * cos) * speed;
        // Slide along obstacles: try each axis on its own.
        const nx = player.x + dx;
        if (walkable(nx, player.z) && !blocked(nx, player.z)) player.x = nx;
        const nz = player.z + dz;
        if (walkable(player.x, nz) && !blocked(player.x, nz)) player.z = nz;
        // Near the open bathroom door: ease towards its middle, so you don't snag on the frame.
        const doorMid = (DOOR.x0 + DOOR.x1) / 2;
        if (bathOpen && Math.abs(player.z - ROOM.z) < 0.9 && Math.abs(player.x - doorMid) < 1) {
          const nudged = player.x + (doorMid - player.x) * Math.min(1, dt * 4);
          if (walkable(nudged, player.z) && !blocked(nudged, player.z)) player.x = nudged;
        }
        player.bob += dt * (keys.has("shift") ? 11 : 8);
      }
    }

    camera.position.set(player.x, EYE + Math.sin(player.bob) * 0.025, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0);

    // What are we looking at?
    let next: Interactable | null = null;
    if (active) {
      camera.getWorldDirection(forward);
      let best = 0.84;
      const inBathNow = player.z > ROOM.z + 0.05;
      for (const t of targets) {
        // The bathroom door works from both sides; everything else only from its own room.
        if (t.kind !== "bathroom" && BATH_ONLY.includes(t.kind) !== inBathNow) continue;
        toTarget.copy(t.pos).sub(camera.position);
        const dist = toTarget.length();
        if (dist > t.reach) continue;
        const dot = toTarget.normalize().dot(forward);
        if (dot > best) {
          best = dot;
          next = t.kind;
        }
      }
    }
    if (next !== prompt) {
      prompt = next;
      cb.onPrompt(prompt);
    }

    clockTimer += dt;
    if (clockTimer > 1) {
      clockTimer = 0;
      drawClock();
    }
    blinkTimer += dt;
    if (blinkTimer > 0.5) {
      blinkTimer = 0;
      blink = !blink;
      drawScreen(blink);
    }
    led.visible = Math.sin(stamp / 300) > -0.2;

    // ---- Easter egg animations
    const tsec = stamp / 1000;
    for (const k in anim) anim[k] = Math.max(0, anim[k] - dt);
    // Duck: hop and spin
    const dh = anim.duck ?? 0;
    duck.position.y = 0.8 + Math.sin((1 - dh) * Math.PI) * 0.12 * (dh > 0 ? 1 : 0);
    duck.rotation.y = -2.2 + (dh > 0 ? (1 - dh) * Math.PI * 2 : 0);
    // Server LEDs: random blinking, red alarm for a moment after a check
    const alarm = (anim.rack ?? 0) > 0.6;
    leds.forEach((l) => {
      const on = Math.sin(tsec * 6 + l.phase * 7) > -0.3;
      l.mat.color.set(alarm ? (Math.sin(tsec * 20) > 0 ? "#ff3b30" : "#5a0f0b") : on ? "#4cff8a" : "#0d3a1d");
    });
    rackGlow.color.set(alarm ? "#ff3b30" : "#4cff8a");
    // Cat: breathes; when petted, lifts its head and wags
    const ct = anim.cat ?? 0;
    cat.scale.y = 1 + Math.sin(tsec * 1.6) * 0.03;
    catHead.rotation.z = ct > 0 ? 0.35 : 0;
    catTail.rotation.y = Math.sin(tsec * (ct > 0 ? 9 : 1.2)) * (ct > 0 ? 0.6 : 0.15);
    // Guitar: rings (wobbles); trophy: spins; wrench: turns
    const gt = anim.guitar ?? 0;
    guitar.rotation.z = Math.sin(tsec * 40) * 0.02 * gt;
    trophy.rotation.y = (anim.trophy ?? 0) > 0 ? (1 - (anim.trophy ?? 0)) * Math.PI * 2 : 0;
    wrench.rotation.y = 0.6 + ((anim.wrench ?? 0) > 0 ? (1 - (anim.wrench ?? 0)) * Math.PI : 0);
    // Bathroom: door swing, the head peeking and talking, steam and water
    doorAngle += ((bathOpen ? -1.65 : 0) - doorAngle) * Math.min(1, dt * 5);
    doorHinge.rotation.y = doorAngle;
    poseVasili(tsec);
    steam.forEach((s) => {
      const u = (s.userData.t + tsec * 0.08) % 1;
      s.position.set(s.userData.x + Math.sin(tsec + s.userData.t * 9) * 0.1, 0.6 + u * 1.9, s.userData.z);
      s.scale.setScalar(0.4 + u * 0.9);
      s.material.opacity = 0.16 * Math.sin(u * Math.PI);
    });
    for (let i = 1; i < dropPos.length; i += 3) {
      dropPos[i] -= dt * 4;
      if (dropPos[i] < 0.08) dropPos[i] = 2.12;
    }
    dropGeo.attributes.position.needsUpdate = true;
    const inBath = player.z > ROOM.z + 0.05;
    if (inBath !== wasInBath) {
      wasInBath = inBath;
      cb.onRoom(inBath ? "bathroom" : "office");
    }

    // Glowing wall text fades in with the lights off
    glowMat.opacity += ((lightsOn ? 0 : 1) - glowMat.opacity) * Math.min(1, dt * 2);

    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (document.visibilityState === "visible") {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setActive(value) {
      active = value;
      if (!value) {
        keys.clear();
        move.x = move.y = 0;
        drags.clear();
        stick.style.display = "none";
        if (document.pointerLockElement === el) document.exitPointerLock();
      }
    },
    lock() {
      if (window.matchMedia("(pointer: fine)").matches) requestLock();
    },
    interact() {
      if (prompt) activate(prompt);
    },
    setBoost(multiplier) {
      boost = multiplier;
    },
    setTalking(value) {
      talking = value;
    },
    setTheme(id) {
      applyTheme(id);
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("visibilitychange", onVisibility);
      if (document.pointerLockElement === el) document.exitPointerLock();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      el.remove();
      stick.remove();
    },
  };
}
