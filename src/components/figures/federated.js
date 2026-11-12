import { HL } from "@/lib/hairline/kernel";

/**
 * Federated: a planner tower with three tubes running out to three vaults of
 * different sizes. The vault under the pointer is the one asked first: a
 * capsule runs out to it and its lid lifts, then the others follow, staggered
 * outwards. Only the capsules travel. The vaults, and what sits in them, never
 * move. The slider is the stagger, in ms.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, identity carried
 * by the vaults' sizes, and a hit test on each vault's resting top.
 */
const {
  Cam, circ, facing, fit, lerp, poly, prism, proj, rings, tdone, tset, tval, tween,
  disposer, mk, place, pointer, put, reflect, register, solid,
} = HL;

const N = 3, XV = [10, 50, 90], YV = 88, HV = [14, 20, 11], RV = [10, 11, 9];
const PX = [38, 48, 58], PY = 24, PH = 22, LIFT = 9, LID = 3.2;
const at = (ring, x, y) => ring.map((q) => ({ u: q.u + x, v: q.v + y, nu: q.nu, nv: q.nv }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 2.05);
  fit(C, [[0, 0, 0], [100, 0, 0], [0, YV + 14, 0], [100, YV + 14, 0], [30, 0, PH + 8], [XV[2], YV, HV[2] + LID + LIFT + 4]], 200, 168);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the planner: a tower of two tiers, with three ports on its front
  const [pb, pbi] = rings(30, 0, 66, PY, 5, 1.6), [pt, pti] = rings(36, 4, 60, PY - 4, 3, 1.2);
  reflect(svg, g, P, front, pb, 0, 14);
  const plan = [solid(g), solid(g)];
  put(plan[0], prism(P, front, pb, pbi, 0, PH));
  put(plan[1], prism(P, front, pt, pti, PH, PH + 8));
  for (const x of PX) mk("path", { d: poly(circ(2.1, 14).map((q) => P(x + q.u, PY, 9 + q.v))), class: "nf lo" }, g);
  for (const el of plan) el.sil.classList.add("hi");

  // a tube to each vault, a flat strip on the ground
  const ends = XV.map((x, i) => [x, YV - RV[i] * 0.2]);
  for (let i = 0; i < N; i++) {
    const [ax, ay] = [PX[i], PY + 3], [bx, by] = [ends[i][0], ends[i][1]], l = Math.hypot(bx - ax, by - ay);
    const nx = (-(by - ay) / l) * 1.7, ny = ((bx - ax) / l) * 1.7;
    mk("path", { d: poly([P(ax + nx, ay + ny, 0), P(bx + nx, by + ny, 0), P(bx - nx, by - ny, 0), P(ax - nx, ay - ny, 0)]), class: "lo" }, g);
  }

  // a capsule on each tube, then the vaults from the far one to the near one
  const caps = XV.map(() => ({ el: solid(g), p: tween(0), drawn: -1 }));
  const cR = circ(2.4, 16), cI = circ(1.5, 16);
  const vaults = XV.map((x, i) => {
    const R = RV[i], H = HV[i], ring = at(circ(R, 28), x, YV), inner = at(circ(R - 1.6, 28), x, YV);
    reflect(svg, g, P, front, ring, 0, 12);
    put(solid(g), prism(P, front, ring, inner, 0, H));
    // what the vault holds, on its top, until the lid covers it
    for (const [dx, dy] of [[-3.5, -2], [3.5, -2], [0, 3.5]]) place(mk("circle", { r: 1.1, class: "dot off" }, g), P(x + dx, YV + dy, H));
    const lid = solid(g), knob = mk("circle", { r: 1.5, class: "dot off" }, g);
    return { x, H, lid, knob, lr: at(circ(R + 0.8, 28), x, YV), li: at(circ(R - 0.8, 28), x, YV), l: tween(0), drawn: -1 };
  });

  const B = register(stage, (_dt, now) => {
    let moving = false;
    caps.forEach((c, i) => {
      const p = tval(c.p, now);
      if (p !== c.drawn) {
        const x = lerp(PX[i], ends[i][0], p), y = lerp(PY + 3, ends[i][1], p);
        put(c.el, prism(P, front, at(cR, x, y), at(cI, x, y), 0, 3.4));
        c.drawn = p;
      }
      if (!tdone(c.p, now)) moving = true;
    });
    vaults.forEach((v) => {
      const l = tval(v.l, now);
      if (l !== v.drawn) {
        put(v.lid, prism(P, front, v.lr, v.li, v.H + l, v.H + l + LID));
        place(v.knob, P(v.x, YV, v.H + l + LID));
        v.drawn = l;
      }
      if (!tdone(v.l, now)) moving = true;
    });
    return moving;
  });
  bag.add(B.unregister);

  /** The vault whose resting top is nearest the point; its box leaves room for a lifted lid. */
  const tops = vaults.map((v) => P(v.x, YV, v.H + LID));
  function hit([x, y]) {
    let best = -1, bd = 1e9;
    tops.forEach(([cx, cy], i) => {
      const dx = Math.abs(x - cx), dy = y - cy, w = RV[i] * C.S + 4;
      if (dx < w && dy > -(LIFT * C.S + 8) && dy < HV[i] * C.S + RV[i] * C.S * 0.5 + 4 && dx < bd) { best = i; bd = dx; }
    });
    return best;
  }

  let act = -1;
  /** Asks vault a first, the rest in turn outwards from it (-1 sends the capsules home). */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    vaults.forEach((v, i) => {
      const d = Math.abs(i - from) * stag;
      if (a >= 0) { tset(caps[i].p, 1, now, d); tset(v.l, i === a ? LIFT : LIFT * 0.5, now, d + 450); }
      else { tset(v.l, 0, now, d); tset(caps[i].p, 0, now, d + 260); }
      v.lid.sil.classList.toggle("hi", i === a); caps[i].el.sil.classList.toggle("hi", i === a);
    });
    for (const el of plan) el.sil.classList.toggle("hi", a < 0);
    read.textContent = a < 0 ? "rest" : "src " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

export const federated = {
  name: "federated",
  means: "One planner, three vaults: capsules run out to every source, the one under the pointer first; the data never moves.",
  rules: [1, 2, 5, 8],
  range: [0, 80, 180],
  tour: [[88, 151], [146, 170], [204, 215], null],
  mount,
};
