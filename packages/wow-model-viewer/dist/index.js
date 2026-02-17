import { useState, useRef, useCallback, useEffect } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/constants.ts
var VIEWER_SLOT_MAP = {
  Head: 1,
  Shoulder: 3,
  Chest: 5,
  Waist: 6,
  Legs: 7,
  Feet: 8,
  Wrist: 9,
  Hands: 10,
  Back: 16,
  "Main Hand": 21,
  "Off Hand": 22,
  Ranged: 26
};
var RACE_IDS = {
  human: 1,
  orc: 2,
  dwarf: 3,
  nightelf: 4,
  undead: 5,
  tauren: 6,
  gnome: 7,
  troll: 8,
  bloodelf: 10,
  draenei: 11
};
var INVENTORY_TYPE = {
  HEAD: 1,
  NECK: 2,
  SHOULDERS: 3,
  SHIRT: 4,
  CHEST: 5,
  WAIST: 6,
  LEGS: 7,
  FEET: 8,
  WRISTS: 9,
  HANDS: 10,
  FINGER: 11,
  TRINKET: 12,
  ONE_HAND: 13,
  SHIELD: 14,
  RANGED: 15,
  BACK: 16,
  TWO_HAND: 17,
  BAG: 18,
  TABARD: 19,
  ROBE: 20,
  MAIN_HAND: 21,
  OFF_HAND: 22,
  HELD_IN_OFF_HAND: 23,
  PROJECTILE: 24,
  THROWN: 25,
  RANGED_RIGHT: 26,
  QUIVER: 27,
  RELIC: 28
};
var NOT_DISPLAYED_SLOTS = [2, 11, 12];

// src/globals.ts
function loadScript(src) {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load: ${src}`)));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
function setupWowheadGlobals(contentPath) {
  window.CONTENT_PATH = contentPath;
  window.WOTLK_TO_RETAIL_DISPLAY_ID_API = void 0;
  if (!window.WH) {
    const webp = { getImageExtension: () => ".webp" };
    window.WH = {
      debug: (...args) => console.log(args),
      defaultAnimation: "Walk",
      WebP: webp,
      Wow: {
        Item: {
          INVENTORY_TYPE_HEAD: INVENTORY_TYPE.HEAD,
          INVENTORY_TYPE_NECK: INVENTORY_TYPE.NECK,
          INVENTORY_TYPE_SHOULDERS: INVENTORY_TYPE.SHOULDERS,
          INVENTORY_TYPE_SHIRT: INVENTORY_TYPE.SHIRT,
          INVENTORY_TYPE_CHEST: INVENTORY_TYPE.CHEST,
          INVENTORY_TYPE_WAIST: INVENTORY_TYPE.WAIST,
          INVENTORY_TYPE_LEGS: INVENTORY_TYPE.LEGS,
          INVENTORY_TYPE_FEET: INVENTORY_TYPE.FEET,
          INVENTORY_TYPE_WRISTS: INVENTORY_TYPE.WRISTS,
          INVENTORY_TYPE_HANDS: INVENTORY_TYPE.HANDS,
          INVENTORY_TYPE_FINGER: INVENTORY_TYPE.FINGER,
          INVENTORY_TYPE_TRINKET: INVENTORY_TYPE.TRINKET,
          INVENTORY_TYPE_ONE_HAND: INVENTORY_TYPE.ONE_HAND,
          INVENTORY_TYPE_SHIELD: INVENTORY_TYPE.SHIELD,
          INVENTORY_TYPE_RANGED: INVENTORY_TYPE.RANGED,
          INVENTORY_TYPE_BACK: INVENTORY_TYPE.BACK,
          INVENTORY_TYPE_TWO_HAND: INVENTORY_TYPE.TWO_HAND,
          INVENTORY_TYPE_BAG: INVENTORY_TYPE.BAG,
          INVENTORY_TYPE_TABARD: INVENTORY_TYPE.TABARD,
          INVENTORY_TYPE_ROBE: INVENTORY_TYPE.ROBE,
          INVENTORY_TYPE_MAIN_HAND: INVENTORY_TYPE.MAIN_HAND,
          INVENTORY_TYPE_OFF_HAND: INVENTORY_TYPE.OFF_HAND,
          INVENTORY_TYPE_HELD_IN_OFF_HAND: INVENTORY_TYPE.HELD_IN_OFF_HAND,
          INVENTORY_TYPE_PROJECTILE: INVENTORY_TYPE.PROJECTILE,
          INVENTORY_TYPE_THROWN: INVENTORY_TYPE.THROWN,
          INVENTORY_TYPE_RANGED_RIGHT: INVENTORY_TYPE.RANGED_RIGHT,
          INVENTORY_TYPE_QUIVER: INVENTORY_TYPE.QUIVER,
          INVENTORY_TYPE_RELIC: INVENTORY_TYPE.RELIC,
          INVENTORY_TYPE_PROFESSION_TOOL: 29,
          INVENTORY_TYPE_PROFESSION_ACCESSORY: 30
        }
      }
    };
  }
}
async function ensureGlobals(contentPath) {
  if (typeof window.ZamModelViewer !== "undefined") return;
  setupWowheadGlobals(contentPath);
  await loadScript("https://code.jquery.com/jquery-3.5.1.min.js");
  await loadScript(`${contentPath}viewer/viewer.min.js`);
}
var styles = {
  container: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    fontSize: 12,
    color: "white"
  },
  loading: {
    position: "absolute",
    bottom: 8,
    left: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: "4px 8px",
    fontSize: 12,
    color: "white"
  },
  title: {
    fontWeight: "bold",
    color: "#facc15"
  },
  select: {
    borderRadius: 4,
    backgroundColor: "#1f2937",
    padding: "2px 4px",
    fontSize: 12,
    color: "white",
    border: "none"
  },
  button: {
    borderRadius: 4,
    backgroundColor: "#374151",
    padding: "2px 4px",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: 12
  },
  info: {
    color: "#9ca3af"
  }
};
function AnimationDebugPanel({ viewer }) {
  const [animations, setAnimations] = useState([]);
  const [currentAnim, setCurrentAnim] = useState("Stand");
  const [paused, setPaused] = useState(false);
  const blendsZeroed = useRef(false);
  const getActor = useCallback(() => {
    var _a, _b;
    return (_b = (_a = viewer == null ? void 0 : viewer.renderer) == null ? void 0 : _a.actors) == null ? void 0 : _b[0];
  }, [viewer]);
  const getSeqs = useCallback(() => {
    var _a, _b, _c;
    const seqs = (_c = (_b = (_a = getActor()) == null ? void 0 : _a.c) == null ? void 0 : _b.k) == null ? void 0 : _c.x;
    return Array.isArray(seqs) ? seqs : null;
  }, [getActor]);
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      var _a;
      attempts++;
      const seqs = getSeqs();
      if (seqs && seqs.length > 0 && ((_a = seqs[0]) == null ? void 0 : _a.l)) {
        setAnimations([...new Set(seqs.map((e) => e.l))]);
        clearInterval(interval);
      }
      if (attempts > 40) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [getSeqs]);
  const handleAnimChange = (name) => {
    var _a;
    setCurrentAnim(name);
    setPaused(false);
    const v = viewer;
    const renderer = v == null ? void 0 : v.renderer;
    if (!blendsZeroed.current) {
      blendsZeroed.current = true;
      if (renderer) renderer.crossFadeDuration = 0;
      const seqs = getSeqs();
      if (seqs) {
        for (const seq of seqs) {
          seq.d = 0;
          seq.j = 0;
        }
      }
    }
    if (window.WH) {
      window.WH.defaultAnimation = name;
    }
    (_a = v == null ? void 0 : v.method) == null ? void 0 : _a.call(v, "setAnimation", name);
  };
  const togglePause = () => {
    var _a;
    const next = !paused;
    setPaused(next);
    const v = viewer;
    (_a = v == null ? void 0 : v.method) == null ? void 0 : _a.call(v, "setAnimPaused", next);
  };
  if (animations.length === 0) {
    return /* @__PURE__ */ jsx("div", { style: styles.loading, children: "Loading animations..." });
  }
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsx("div", { style: styles.title, children: "Animation Debug" }),
    /* @__PURE__ */ jsx(
      "select",
      {
        value: currentAnim,
        onChange: (e) => handleAnimChange(e.target.value),
        style: styles.select,
        children: animations.map((a) => /* @__PURE__ */ jsx("option", { value: a, children: a }, a))
      }
    ),
    /* @__PURE__ */ jsx("button", { onClick: togglePause, style: styles.button, children: paused ? "\u25B6 Play" : "\u23F8 Pause" }),
    /* @__PURE__ */ jsxs("div", { style: styles.info, children: [
      animations.length,
      " animations available"
    ] })
  ] });
}
function resolveRaceId(race) {
  var _a;
  if (typeof race === "number") return race;
  return (_a = RACE_IDS[race]) != null ? _a : 1;
}
function WowModelViewer({
  contentPath,
  race = "human",
  gender = 0,
  items = [],
  aspect = 3 / 4,
  animation = "Walk",
  debug = false,
  className,
  dataEnv = "classic",
  onReady,
  onError
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const idRef = useRef(`model-viewer-${Math.random().toString(36).slice(2, 9)}`);
  const cameraRef = useRef(null);
  const animationRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);
  const raceId = resolveRaceId(race);
  const itemsKey = JSON.stringify(items);
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.id = idRef.current;
    let cancelled = false;
    let cameraPollId = null;
    setViewerReady(false);
    const initViewer = async () => {
      try {
        await ensureGlobals(contentPath);
        if (cancelled) return;
        const raceGenderId = raceId * 2 - 1 + gender;
        const parsedItems = JSON.parse(itemsKey);
        const filteredItems = parsedItems.filter(([slot]) => !NOT_DISPLAYED_SLOTS.includes(slot));
        const config = {
          type: 2,
          contentPath,
          container: window.jQuery(`#${idRef.current}`),
          aspect,
          dataEnv,
          env: dataEnv,
          gameDataEnv: dataEnv,
          hd: false,
          items: filteredItems,
          models: {
            id: raceGenderId,
            type: 16
            // CHARACTER
          }
        };
        const viewer = await new window.ZamModelViewer(config);
        if (cancelled) return;
        viewerRef.current = viewer;
        setViewerReady(true);
        onReady == null ? void 0 : onReady();
        const v = viewer;
        cameraPollId = setInterval(() => {
          var _a, _b, _c, _d;
          if (v.renderer) {
            cameraRef.current = {
              azimuth: v.renderer.azimuth,
              zenith: v.renderer.zenith,
              distance: v.renderer.distance,
              zoomTarget: (_b = (_a = v.renderer.zoom) == null ? void 0 : _a.target) != null ? _b : 1,
              zoomCurrent: (_d = (_c = v.renderer.zoom) == null ? void 0 : _c.current) != null ? _d : 1
            };
          }
        }, 250);
        const waitForModel = setInterval(() => {
          var _a, _b, _c, _d, _e, _f, _g;
          if (cancelled) {
            clearInterval(waitForModel);
            return;
          }
          const seqs = (_e = (_d = (_c = (_b = (_a = v.renderer) == null ? void 0 : _a.actors) == null ? void 0 : _b[0]) == null ? void 0 : _c.c) == null ? void 0 : _d.k) == null ? void 0 : _e.x;
          if (Array.isArray(seqs) && seqs.length > 0 && ((_f = seqs[0]) == null ? void 0 : _f.l)) {
            clearInterval(waitForModel);
            if (v.renderer) v.renderer.crossFadeDuration = 0;
            for (const seq of seqs) {
              seq.d = 0;
              seq.j = 0;
            }
            const anim = animationRef.current || animation;
            if (window.WH) {
              ;
              window.WH.defaultAnimation = anim;
            }
            (_g = v.method) == null ? void 0 : _g.call(v, "setAnimation", anim);
            if (cameraRef.current && v.renderer) {
              const saved = __spreadValues({}, cameraRef.current);
              v.renderer.azimuth = saved.azimuth;
              v.renderer.zenith = saved.zenith;
              v.renderer.distance = saved.distance;
              if (v.renderer.zoom) {
                v.renderer.zoom.target = saved.zoomTarget;
                v.renderer.zoom.current = saved.zoomCurrent;
              }
            }
          }
        }, 200);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Model viewer init error:", error);
        onError == null ? void 0 : onError(error);
      }
    };
    initViewer();
    return () => {
      var _a, _b, _c;
      cancelled = true;
      if (cameraPollId) clearInterval(cameraPollId);
      const defaultAnim = (_a = window.WH) == null ? void 0 : _a.defaultAnimation;
      if (typeof defaultAnim === "string") {
        animationRef.current = defaultAnim;
      }
      (_c = (_b = viewerRef.current) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
      container.innerHTML = "";
      viewerRef.current = null;
    };
  }, [raceId, gender, itemsKey, contentPath, dataEnv, aspect]);
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", overflow: "hidden", width: "100%", height: "100%" }, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: containerRef,
        className,
        style: { width: "100%", height: "100%" }
      }
    ),
    debug && viewerReady && viewerRef.current && /* @__PURE__ */ jsx(AnimationDebugPanel, { viewer: viewerRef.current })
  ] });
}
var cache = /* @__PURE__ */ new Map();
var pending = /* @__PURE__ */ new Map();
function getCache(baseUrl) {
  let c = cache.get(baseUrl);
  if (!c) {
    c = /* @__PURE__ */ new Map();
    cache.set(baseUrl, c);
  }
  return c;
}
function getPending(baseUrl) {
  let p = pending.get(baseUrl);
  if (!p) {
    p = /* @__PURE__ */ new Map();
    pending.set(baseUrl, p);
  }
  return p;
}
async function fetchDisplayInfo(itemId, options) {
  var _a;
  const baseUrl = (_a = options == null ? void 0 : options.baseUrl) != null ? _a : "/api/wowhead-display-id";
  const c = getCache(baseUrl);
  const p = getPending(baseUrl);
  const cached = c.get(itemId);
  if (cached !== void 0) return cached;
  const inflight = p.get(itemId);
  if (inflight) return inflight;
  const promise = fetch(`${baseUrl}/${itemId}`).then((res) => res.json()).then((data) => {
    const info = {
      displayId: data.displayId || 0,
      slotId: data.slotId || 0
    };
    c.set(itemId, info);
    p.delete(itemId);
    return info;
  }).catch(() => {
    p.delete(itemId);
    return { displayId: 0, slotId: 0 };
  });
  p.set(itemId, promise);
  return promise;
}
async function fetchBatch(itemIds, options) {
  const results = await Promise.all(
    itemIds.map(async (id) => [id, await fetchDisplayInfo(id, options)])
  );
  return Object.fromEntries(results);
}
function useDisplayIds(itemIds, options) {
  var _a;
  const [displayInfos, setDisplayInfos] = useState({});
  const baseUrl = (_a = options == null ? void 0 : options.baseUrl) != null ? _a : "/api/wowhead-display-id";
  const getDisplayInfo = useCallback(
    (itemId) => displayInfos[itemId] || null,
    [displayInfos]
  );
  useEffect(() => {
    if (itemIds.length === 0) return;
    let cancelled = false;
    const c = getCache(baseUrl);
    const known = {};
    const toFetch = [];
    for (const id of itemIds) {
      const cached = c.get(id);
      if (cached !== void 0) {
        known[id] = cached;
      } else {
        toFetch.push(id);
      }
    }
    if (Object.keys(known).length > 0) {
      setDisplayInfos((prev) => __spreadValues(__spreadValues({}, prev), known));
    }
    if (toFetch.length === 0) return;
    fetchBatch(toFetch, options).then((results) => {
      if (!cancelled) {
        setDisplayInfos((prev) => __spreadValues(__spreadValues({}, prev), results));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [itemIds.join(","), baseUrl]);
  return { getDisplayInfo, displayInfos };
}

export { AnimationDebugPanel, INVENTORY_TYPE, NOT_DISPLAYED_SLOTS, RACE_IDS, VIEWER_SLOT_MAP, WowModelViewer, fetchDisplayInfo, useDisplayIds };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map