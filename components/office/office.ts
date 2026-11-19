import type * as T from "three";

/**
 * "Vasili's office": a small first-person scene built from boxes and canvas
 * textures, no model files. Walk around, look at things, use them. The
 * computer on the desk opens the motto picker (handled by React).
 */

export type Interactable = "computer" | "coffee" | "door" | "whiteboard" | "portrait" | "plant";

export type OfficeTexts = {
  board: string[];
  plate: string;
  os: string;
  screenHint: string;
  /** Name and role on the monitor. */
  statsLines: string[];
  stats: { label: string; value: number }[];
  footer: string;
};

export type OfficeCallbacks = {
  /** The object the player is looking at and close enough to use (null: none). */
  onPrompt: (target: Interactable | null) => void;
  onInteract: (target: Interactable) => void;
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
  scene.add(new THREE.HemisphereLight("#fff8ee", "#b9a891", 0.9));
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
    box(1.2, 0.04, 0.6, mat("#ffffff", { emissive: "#fff6e8", emissiveIntensity: 1.4 }), x, ROOM.h - 0.05, z, { shadow: false });
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
  box(ROOM.x * 2, ROOM.h, T_, wallMat, 0, 0, ROOM.z + T_ / 2);
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
    track(new THREE.MeshBasicMaterial({ map: view.tex })),
  );
  viewPlane.position.set(-ROOM.x - 3, 1.7, winMid);
  viewPlane.rotation.y = Math.PI / 2;
  scene.add(viewPlane);

  // Skirting
  const skirt = mat("#d9d2c5");
  box(ROOM.x * 2, 0.08, 0.02, skirt, 0, 0, -ROOM.z + 0.01, { shadow: false });
  box(ROOM.x * 2, 0.08, 0.02, skirt, 0, 0, ROOM.z - 0.01, { shadow: false });
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
  plant(-ROOM.x + 0.45, -ROOM.z + 0.45, 1.6, true);
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

  // ---- Player
  const player = { x: 1.2, z: 3.6, yaw: 0.25, pitch: -0.05, bob: 0 };
  const keys = new Set<string>();
  let active = false;
  let locked = false;
  let prompt: Interactable | null = null;
  const move = { x: 0, y: 0 }; // touch joystick, -1 … 1
  const el = renderer.domElement;

  const collide = (x: number, z: number) => {
    x = Math.max(-ROOM.x + RADIUS, Math.min(ROOM.x - RADIUS, x));
    z = Math.max(-ROOM.z + RADIUS, Math.min(ROOM.z - RADIUS, z));
    return { x, z };
  };
  const blocked = (x: number, z: number) =>
    solids.some((b) => x > b.x0 - RADIUS && x < b.x1 + RADIUS && z > b.z0 - RADIUS && z < b.z1 + RADIUS);

  const look = (dx: number, dy: number, scale: number) => {
    player.yaw -= dx * scale;
    player.pitch = Math.max(-1.3, Math.min(1.3, player.pitch - dy * scale));
  };

  const onKey = (e: KeyboardEvent) => {
    if (!active) return;
    const k = e.key.toLowerCase();
    if (e.type === "keydown") {
      if ((k === "e" || k === "enter") && prompt) {
        e.preventDefault();
        cb.onInteract(prompt);
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
      if (!locked) el.requestPointerLock?.();
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
    if (d && e.pointerType !== "mouse" && Math.hypot(e.clientX - d.ox, e.clientY - d.oy) < 8 && prompt) cb.onInteract(prompt);
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
        const speed = (run ? 4.2 : 2.4) * Math.min(1, len) * dt;
        fx /= len;
        fz /= len;
        const sin = Math.sin(player.yaw);
        const cos = Math.cos(player.yaw);
        const dx = (fx * cos - fz * sin) * speed;
        const dz = (-fx * sin - fz * cos) * speed;
        // Slide along obstacles: try each axis on its own.
        let p = collide(player.x + dx, player.z);
        if (!blocked(p.x, p.z)) player.x = p.x;
        p = collide(player.x, player.z + dz);
        if (!blocked(p.x, p.z)) player.z = p.z;
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
      for (const t of targets) {
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
      if (window.matchMedia("(pointer: fine)").matches) el.requestPointerLock?.();
    },
    interact() {
      if (prompt) cb.onInteract(prompt);
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
