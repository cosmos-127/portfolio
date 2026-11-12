import { HL } from "@/lib/hairline/kernel";

/**
 * Patchbay: a low bay with five jack sockets along its front and a tool module
 * standing behind each. Beside it sits the agent, a small box with one cable
 * and one plug, parked at rest. The socket under the pointer takes the plug:
 * it hops across on its cable, that socket's module rises, and the neighbours
 * sink to make way, staggered outwards. The slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, identity carried
 * by dots, and a hit test against the rest pose of each module and of the bay.
 */
const {
  Cam, circ, clamp, facing, fit, open, poly, prism, proj, ringAt, rings, unproj,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, reflect, register, solid,
} = HL;

const N = 5, G = 24, X0 = 18, SY = 34, BW = 132, BD = 46, BH = 12;
const MW = 8, MY0 = 4, MY1 = 22, REST = [9, 17, 6, 13, 8], ACT = 26;
const AX = -27, AH = 20, GY = 23, PH = 16, HOP = 9;
const NAMES = ["api", "db", "fs", "web", "git"];

const sx = (i) => X0 + i * G;
const at = (ring, x, y) => ring.map((q) => ({ u: q.u + x, v: q.v + y, nu: q.nu, nv: q.nv }));
const smooth = (t) => t * t * (3 - 2 * t);
const inside = (q, x0, y0, x1, y1, m) => q[0] > x0 - m && q[0] < x1 + m && q[1] > y0 - m && q[1] < y1 + m;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  // The camera is fitted with a module risen and the cable at its longest reach.
  const C = Cam(45, 0.5, 1.95);
  fit(C, [[-42, 14, 0], [-42, 46, 0], [BW, 0, 0], [BW, BD, 0], [0, 0, BH + ACT], [AX, SY, 64], [sx(N - 1), SY, 64]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  /** A jack lying on a top at height z: its rim, which is returned, and its hole. */
  const jack = (x, z) => {
    const rim = mk("path", { d: poly(ringAt(P, at(circ(5, 24), x, SY), z)), class: "nf" }, g);
    mk("path", { d: poly(ringAt(P, at(circ(2.6, 16), x, SY), z)), class: "nf lo" }, g);
    return rim;
  };

  // the agent: a box, the grommet its cable leaves by, and the jack its plug parks in
  const [agent, agentIn] = rings(-42, 14, -12, 46, 8, 1.6);
  reflect(svg, g, P, front, agent, 0, 14);
  put(solid(g), prism(P, front, agent, agentIn, 0, AH));
  mk("path", { d: poly(ringAt(P, at(circ(3, 16), AX, GY), AH)), class: "nf lo" }, g);
  jack(AX, AH);

  // the bay, then its modules from the far end to the near one
  const [bay, bayIn] = rings(0, 0, BW, BD, 6, 1.6);
  reflect(svg, g, P, front, bay, 0, 14);
  put(solid(g), prism(P, front, bay, bayIn, 0, BH));
  const mods = [];
  for (let i = 0; i < N; i++) {
    const [ring, inner] = rings(sx(i) - MW, MY0, sx(i) + MW, MY1, 3, 1.2);
    mods.push({ ring, inner, el: solid(g), h: tween(REST[i]), drawn: -1 });
  }

  // the sockets, each numbered in dots along the bay's front edge
  const rims = [], dots = [];
  for (let i = 0; i < N; i++) {
    rims.push(jack(sx(i), BH));
    const row = [];
    for (let k = 0; k <= i; k++) {
      const el = mk("circle", { r: 1.05, class: "dot off" }, g);
      place(el, P(sx(i) + (k - i / 2) * 2.7, 42.4, BH));
      row.push(el);
    }
    dots.push(row);
  }

  // the cable and its plug: a collar and a body
  const cable = mk("path", { class: "nf sil" }, g);
  const collar = solid(g), body = solid(g);
  const cR = circ(4.4, 24), cI = circ(3.5, 24), bR = circ(3, 20), bI = circ(2.2, 20);
  collar.sil.classList.add("hi"); body.sil.classList.add("hi");
  const px = tween(AX), pb = tween(AH);

  /** The plug standing at x with its foot at z, and the cable arching to it from the grommet. */
  function drawPlug(x, z) {
    put(collar, prism(P, front, at(cR, x, SY), at(cI, x, SY), z, z + 3));
    put(body, prism(P, front, at(bR, x, SY), at(bI, x, SY), z + 3, z + PH));
    const rise = 12 + 0.12 * Math.abs(x - AX), pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      pts.push(P(AX * (a + b) + x * (c + d), GY * (a + b) + SY * (c + d), AH * a + (AH + rise) * b + (z + PH + rise) * c + (z + PH) * d));
    }
    cable.setAttribute("d", open(pts));
  }

  // The hop is read off the plug's travel: it lifts as it leaves a jack and sinks as it nears the next.
  let h0 = 0, hop = 0, lx = NaN, lb = NaN;
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const m of mods) {
      const h = tval(m.h, now);
      if (h !== m.drawn) { put(m.el, prism(P, front, m.ring, m.inner, BH, BH + h)); m.drawn = h; }
      if (!tdone(m.h, now)) moving = true;
    }
    const x = tval(px, now), b = tval(pb, now);
    if (x !== lx || b !== lb) {
      const dep = smooth(clamp(Math.abs(x - px.from) / 10, 0, 1)), arr = smooth(clamp(Math.abs(x - px.to) / 10, 0, 1));
      hop = HOP * arr * (h0 + (1 - h0) * dep);
      drawPlug(x, b + hop); lx = x; lb = b;
    }
    if (!tdone(px, now) || !tdone(pb, now)) moving = true;
    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  /** The socket under the point, read from rest poses: each module's own top, then the bay's top and foot. The risen module keeps its target top. */
  function hit([x, y]) {
    for (let i = N - 1; i >= 0; i--) {
      const hs = i === act ? [ACT, REST[i], REST[i] / 2] : [REST[i], REST[i] / 2];
      for (const h of hs) if (inside(unproj(C, x, y, BH + h), sx(i) - MW, MY0, sx(i) + MW, MY1, 1.5)) return i;
    }
    for (const z of [BH, 0]) {
      const q = unproj(C, x, y, z);
      if (inside(q, 0, 0, BW, BD, 4)) return clamp(Math.round((q[0] - X0) / G), 0, N - 1);
    }
    return -1;
  }

  /** Plugs into socket a (-1 parks the plug). The stagger spreads out from the socket taken, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    mods.forEach((m, i) => {
      const d = Math.abs(i - from);
      tset(m.h, a < 0 ? REST[i] : i === a ? ACT : REST[i] * clamp(0.35 + 0.18 * d, 0, 1), now, d * stag);
      m.el.sil.classList.toggle("hi", i === a); rims[i].classList.toggle("hi", i === a);
      for (const el of dots[i]) el.setAttribute("class", i === a ? "dot m" : "dot off");
    });
    h0 = hop / HOP;
    tset(px, a < 0 ? AX : sx(a), now, 0); tset(pb, a < 0 ? AH : BH, now, 0);
    collar.sil.classList.toggle("hi", a < 0); body.sil.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

export const patchbay = {
  name: "patchbay",
  means: "An agent's one cable and five typed sockets: the plug hops to the socket under the pointer and its tool rises.",
  rules: [1, 2, 5, 8],
  range: [0, 45, 100],
  tour: [[148, 172], [210, 146], [280, 238], null],
  mount,
};
