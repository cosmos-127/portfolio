import { HL } from "@/lib/hairline/kernel";

/**
 * Graphrag: a card-catalogue cabinet of eight drawers, a few left ajar. The
 * drawer under the pointer slides out and the drawers its links reach follow,
 * the first hop most and the second less. The links are not the layout, so a
 * neighbour on the face can stay shut while one across it opens. The slider
 * is the stagger per hop, in ms.
 *
 * The pattern: discrete items spread over a graph. Tweens, a stagger by hop,
 * identity carried by the pull and label of each drawer, and a hit test on the
 * resting face, plus the active drawer's own target plate.
 */
const {
  Cam, clamp, facing, fit, poly, prism, proj, rings, rrect, unproj,
  tdone, tset, tval, tween, disposer, mk, pointer, put, reflect, register, solid,
} = HL;

const W = 170, D = 30, H = 58, COLS = 4, ROWS = 2, M = 5, OUT = [16, 7, 3], HI0 = 2;
const SW = (W - (COLS + 1) * M) / COLS, SH = (H - (ROWS + 1) * M) / ROWS;
const REST = [0, 0, 6, 0, 0, 3, 0, 0];
const EDGES = [[0, 1], [1, 5], [5, 6], [6, 2], [2, 3], [3, 7], [4, 5], [0, 4]];
const N = COLS * ROWS;

/** Hops from each drawer to every other, along the links. */
const DIST = Array.from({ length: N }, (_, s) => {
  const d = Array(N).fill(9);
  d[s] = 0;
  for (const q = [s]; q.length;) {
    const a = q.shift();
    for (const [u, v] of EDGES) for (const [p, r] of [[u, v], [v, u]]) if (p === a && d[r] === 9) { d[r] = d[a] + 1; q.push(r); }
  }
  return d;
});

/** Drawer i's face, as x0, z0, x1, z1. */
const slot = (i) => {
  const x0 = M + (i % COLS) * (SW + M), z1 = H - M - Math.floor(i / COLS) * (SH + M);
  return [x0, z1 - SH, x0 + SW, z1];
};

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 1.82);
  fit(C, [[0, 0, 0], [W, 0, 0], [0, D + OUT[0], 0], [W, D + OUT[0], 0], [0, 0, H], [W, D, H]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  const [body, bodyIn] = rings(0, 0, W, D, 5, 1.6);
  reflect(svg, g, P, front, body, 0, 14);
  put(solid(g), prism(P, front, body, bodyIn, 0, H));
  for (let i = 0; i < N; i++) {
    const [x0, z0, x1, z1] = slot(i);
    mk("path", { d: poly(rrect(x0 - 1, z0 - 1, x1 + 1, z1 + 1, 3, 4).map((q) => P(q.u, D, q.v))), class: "nf lo" }, g);
  }

  const dg = mk("g", {}, g);
  const drawers = [];
  for (let i = 0; i < N; i++) {
    const [x0, z0, x1, z1] = slot(i), cx = (x0 + x1) / 2, el = mk("g", {}, dg);
    drawers.push({
      el, x0, z0, x1, z1,
      top: mk("path", { class: "nf lo" }, el),
      side: mk("path", { class: "lo" }, el),
      face: mk("path", { class: "sil", d: "" }, el),
      label: mk("path", { class: "nf lo" }, el),
      pull: mk("path", { class: "nf" }, el),
      ring: rrect(x0, z0, x1, z1, 2.4, 4),
      lab: rrect(cx - 6.5, z1 - 9, cx + 6.5, z1 - 4.5, 1, 3),
      grip: rrect(cx - 4.5, z0 + 3, cx + 4.5, z0 + 6.2, 1.5, 3),
      o: tween(REST[i]), drawn: -1,
    });
  }

  function draw(d, o) {
    const y = D + o, at = (ring) => poly(ring.map((q) => P(q.u, y, q.v)));
    d.top.setAttribute("d", o > 0.3 ? poly([P(d.x0, D, d.z1), P(d.x1, D, d.z1), P(d.x1, y, d.z1), P(d.x0, y, d.z1)]) : "");
    d.side.setAttribute("d", o > 0.3 ? poly([P(d.x1, D, d.z0), P(d.x1, y, d.z0), P(d.x1, y, d.z1), P(d.x1, D, d.z1)]) : "");
    d.face.setAttribute("d", at(d.ring));
    d.label.setAttribute("d", at(d.lab));
    d.pull.setAttribute("d", at(d.grip));
  }

  // a drawer pulled further is nearer the viewer, so it is painted later
  let order = "";
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const d of drawers) {
      const o = tval(d.o, now);
      if (o !== d.drawn) { draw(d, o); d.drawn = o; }
      if (!tdone(d.o, now)) moving = true;
    }
    const next = drawers.map((d, i) => i).sort((a, b) => drawers[a].drawn - drawers[b].drawn || a - b);
    if (next.join() !== order) { order = next.join(); for (const i of next) dg.appendChild(drawers[i].el); }
    return moving;
  });
  bag.add(B.unregister);

  /** The point as a spot on the plane y = Y: [x, z]. */
  const onPlane = (x, y, Y) => {
    const a = unproj(C, x, y, 0), b = unproj(C, x, y, 100), t = (Y - a[1]) / (b[1] - a[1]);
    return [a[0] + t * (b[0] - a[0]), 100 * t];
  };

  let act = -1;
  /** The drawer under the point: the active one's own target plate first, then the resting face. */
  function hit([sx, sy]) {
    if (act >= 0) {
      const [x, z] = onPlane(sx, sy, D + OUT[0]), d = drawers[act];
      if (x > d.x0 && x < d.x1 && z > d.z0 && z < d.z1) return act;
    }
    const [x, z] = onPlane(sx, sy, D);
    if (x < -2 || x > W + 2 || z < -2 || z > H + 2) return -1;
    const c = clamp(Math.floor((x - M / 2) / (SW + M)), 0, COLS - 1), r = clamp(Math.floor((H - M / 2 - z) / (SH + M)), 0, ROWS - 1);
    return r * COLS + c;
  }

  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    drawers.forEach((d, i) => {
      const hop = DIST[from][i], bright = i === a || (a < 0 && i === HI0);
      tset(d.o, a < 0 ? REST[i] : OUT[DIST[a][i]] || 0, now, Math.min(hop, 4) * stag);
      d.face.classList.toggle("hi", bright); d.pull.classList.toggle("hi", bright);
    });
    read.textContent = a < 0 ? "rest" : "node " + (a + 1);
    B.wake();
  }
  drawers[HI0].face.classList.add("hi"); drawers[HI0].pull.classList.add("hi");

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

export const graphrag = {
  name: "graphrag",
  means: "A catalogue cabinet: the drawer under the pointer slides out, and the drawers its links reach follow, hop by hop.",
  rules: [1, 2, 5, 8],
  range: [0, 70, 160],
  tour: [[111, 110], [164, 137], [271, 231], null],
  mount,
};
