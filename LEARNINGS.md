# Gear Journey - Learnings

## Format

Each entry follows Problem/Solution format:

### [Date] - Brief Title

**Problem:** What unexpected thing happened

**Attempted Solutions:**
1. First thing tried
2. Second thing tried

**Final Solution:** What actually worked

**Insight:** What we learned for the future

---

## Entries

### 2026-02-15 - ZamModelViewer display IDs are NOT from item_template.sql

**Problem:** 3D model viewer showed a naked character despite passing display IDs from `item_template.sql` (`display_id` column). The viewer logged "Creating item 8717" / "Loading item 3498" but rendered nothing.

**Attempted Solutions:**
1. Built `display-ids.json` from `item_template.sql` parsing `display_id` column — IDs are from mangos/classic `ItemDisplayInfo.dbc`, NOT what ZamModelViewer expects.
2. Tested CDN URLs directly: `meta/armor/5/8717.json` → 404. The mangos DBC IDs don't exist on Wowhead's CDN.

**Final Solution:** Fetch display IDs from Wowhead's XML API at runtime (`/classic/item={id}&xml` → `<icon displayId="7551">`). Created `/api/wowhead-display-id/[itemId]` proxy route. Only ~15-30 API calls needed (BiS list size), cached after first fetch.

**Insight:** Wowhead's model viewer CDN uses its own display ID system, completely different from the classic `ItemDisplayInfo.dbc` IDs in mangos databases. For item 5341 (Spore-covered Tunic): mangos `display_id` = 8717, Wowhead `displayId` = 7551. No predictable mapping between the two. Always use Wowhead's XML API as the source of truth for ZamModelViewer display IDs.

---

### 2026-02-15 - ZamModelViewer slot IDs use InventoryType, not equipment slots

**Problem:** Armor rendered on the 3D model but weapons and cloaks did not. The viewer received correct Wowhead display IDs but items were invisible.

**Attempted Solutions:**
1. Confirmed display IDs were correct by checking CDN URLs — `meta/item/2038.json` returned 200 for a weapon.
2. Investigated the viewer source: `meta/armor/{slot}/` is used for armor slots [1,3,4,5,6,7,8,9,10,16,19,20], `meta/item/` for everything else.

**Final Solution:** Fixed `VIEWER_SLOT_MAP` to use WoW `InventoryType` enum values instead of equipment slot IDs. They match for slots 1-10 but differ for: Back (15→16), Main Hand (16→21), Off Hand (17→22), Ranged (18→26). With equipment slot 16, Main Hand was hitting `meta/armor/16/` (the cloak path!).

**Insight:** ZamModelViewer uses WoW's `InventoryType` IDs throughout — for CDN URL routing AND body positioning. Equipment slot IDs (used internally by WoW for the paperdoll) are a different numbering system that only coincidentally matches for slots 1-10.

---

### 2026-02-15 - ZamModelViewer idle tilt/fidget (UNRESOLVED)

**Problem:** The 3D character model occasionally tilts/leans to one side for a few frames, then returns to normal standing pose. This is a periodic idle fidget sub-animation built into WoW character models.

**Attempted Solutions:**
1. Stabilized `viewerItems` array reference with serialized `itemsKey` to prevent unnecessary viewer destroy/recreate cycles — tilt persisted, was not caused by re-initialization.
2. Called `viewer.renderer?.models?.[0]?.setAnimNoSubAnim?.(0)` after viewer creation — no effect (wrong access path; models vs actors).
3. Called `viewer.renderer?.actors?.[0]?.setAnimPaused?.(true)` (correct path per [Miorey/wow-model-viewer](https://github.com/Miorey/wow-model-viewer)) — tilt persisted.

**Final Solution:** UNRESOLVED. The idle fidget may be baked into the Stand animation data itself, or the method calls may not be reaching the internal animation system. ZamModelViewer is a minified third-party library with limited documentation.

**Insight:** ZamModelViewer API access path is `renderer.actors[0]` (not `renderer.models[0]`). Available methods: `setAnimation(name)`, `setAnimPaused(bool)`, `setAnimNoSubAnim(id)`. The viewer source also has `setTPose(bool)` which could force a static T-pose but would look unnatural. Further investigation needed — may require inspecting network traffic or the viewer's internal animation state machine.

---

### 2026-02-16 - ZamModelViewer animation control (minified internals)

**Problem:** Needed to build a debug animation selector to isolate the idle tilt. The `wow-model-viewer` npm wrapper exposes `getListAnimations()` and `setAnimation()`, but the raw ZamModelViewer minifies all internal methods — `renderer.actors[0]` has no `getListAnimations` or `setAnimation` methods.

**Attempted Solutions:**
1. Tried calling `actor.getListAnimations()` / `actor.setAnimation(name)` — methods don't exist on minified actor (26 keys, zero callable methods).
2. Checked `wow-model-viewer` wrapper source — it used `actor.h.P.Q.map(e => e.l)` for animation names, but minified property names have changed between versions.
3. Searched all nested properties on the actor for arrays of objects with `.l` (name) fields.

**Final Solution:** Animation names live at `actor.c.k.x[].l` in the current minified build (129 unique animations like Stand, Walk, Attack1H, etc.). Each sequence object has: `m` (anim ID), `a` (variation), `i` (duration ms), `d` (blend time), `b` (frequency), `j` (blend time 2), `c` (flags), `l` (name). To change animations, use `viewer.method('setAnimation', name)` — the top-level viewer dispatcher, NOT direct actor method calls. To pause: `viewer.method('setAnimPaused', bool)`.

**Insight:** The minified ZamModelViewer changes property names between versions, so the `wow-model-viewer` npm wrapper's paths are stale. The viewer's `method()` dispatcher is the stable public API — it routes to internal actor methods by name. Always use `viewer.method(name, args)` rather than trying to call minified methods directly.

---

### 2026-02-16 - ZamModelViewer animation looping requires zeroing blend times

**Problem:** Animations selected via the debug panel played once then snapped/stuttered instead of looping smoothly. Walk (1000ms duration) had a visible hitch at the loop point.

**Attempted Solutions:**
1. Set `WH.defaultAnimation = name` before calling `setAnimation` — animation did loop (viewer returns to default after one-shot), but with a visible transition gap.
2. Set `renderer.crossFadeDuration = 0` — reduced but didn't eliminate the snap.
3. Used `setInterval` to re-trigger `setAnimation` on a timer matching the animation duration — caused worse stuttering (timer drift fights the viewer's internal clock).

**Final Solution:** Zero out blend/transition times on ALL animation sequences: `seq.d = 0` and `seq.j = 0` for every entry in `actor.c.k.x`, plus `renderer.crossFadeDuration = 0`. Combined with `WH.defaultAnimation = name`, the viewer loops seamlessly via its built-in default-animation mechanism. The sequence field `d` (default ~2080ms) was the primary culprit — it's the blend time between animation transitions, and was longer than most animation durations.

**Insight:** ZamModelViewer's animation loop works by: play animation → finish → transition to `WH.defaultAnimation`. It's not a true loop; it's a repeated one-shot with crossfade. Three blend sources must all be zeroed: `renderer.crossFadeDuration`, `sequence.d`, and `sequence.j`. The blend times must be zeroed AFTER the model fully loads (sequences aren't available immediately when the viewer promise resolves) — poll `actor.c.k.x` until populated.

---

### 2026-02-16 - ZamModelViewer aspect ratio must match container

**Problem:** The 3D model canvas had a large dead black space at the bottom of its container. The model rendered in the top portion with empty black below.

**Final Solution:** Changed the viewer config `aspect` from `1` (square) to `3/4` to match the paperdoll container's `aspect-[3/4]` CSS. The viewer renders its canvas at whatever aspect ratio is specified in config — it must match the CSS container's aspect ratio.

**Insight:** ZamModelViewer's `aspect` config controls the canvas rendering ratio, not just cropping. Mismatch with the CSS container creates dead space. Always keep `config.aspect` in sync with the container's CSS aspect ratio.

---

### 2026-02-16 - ZamModelViewer camera state preservation across recreations

**Problem:** When the viewer is destroyed and recreated (e.g. items change on level scrub), the camera orientation (azimuth/zenith/distance) resets to defaults, losing the user's viewing angle.

**Attempted Solutions:**
1. Passed `azimuth`, `zenith`, `distance` in the ZamModelViewer config object — viewer ignores unknown config keys, no effect.
2. Set `renderer.azimuth/zenith/distance` directly after model load — worked once but the renderer's internal initialization overwrites values after a few frames.
3. Used `requestAnimationFrame` loop (10 frames) to repeatedly apply saved values after model load — worked for the first recreation but broke on subsequent ones because camera state was read from the renderer at destroy time, by which point the renderer had drifted back to defaults.

**Final Solution:** Three-part fix:
1. Stabilized `items` prop with `JSON.stringify` to avoid unnecessary destroy/recreate cycles when the array reference changes but values haven't.
2. Poll `renderer.azimuth`, `renderer.zenith`, `renderer.distance`, `renderer.zoom.target`, and `renderer.zoom.current` every 250ms into a ref — continuous polling captures the latest state regardless of interaction type.
3. After model loads, restore all five values directly. Rotation (`azimuth`/`zenith`) can be set on the renderer directly. Zoom requires setting `zoom.target` and `zoom.current` on the renderer's zoom object — setting `renderer.distance` alone does NOT work because the zoom interpolation system overwrites it.

**Insight:** ZamModelViewer's zoom is controlled by `renderer.zoom` — an interpolation system with `target`, `current`, `rateCurrent`, `interpolationRate`, and `range` properties. The `distance` property on the renderer is *derived* from the zoom object's state. Setting `distance` directly is immediately overwritten by the zoom interpolation. To persist zoom level, save and restore `zoom.target` and `zoom.current`. Rotation (`azimuth`/`zenith`) can be set directly on the renderer without issues. Passing camera values in the ZamModelViewer config object has no effect — those keys are ignored.

---

### 2026-02-16 - ZamModelViewer robes: Wowhead XML lies about inventorySlot, must probe CDN

**Problem:** Robes didn't render on the 3D model. ZamModelViewer uses `meta/armor/{slot}/{displayId}.json` on the CDN, where slot 5 = Chest and slot 20 = Robe. But Wowhead's XML API returns `inventorySlot id="5"` for BOTH regular chest pieces and robes — it doesn't distinguish them. Passing slot 5 for a robe hits `meta/armor/5/{displayId}.json` → 404 → invisible item.

**Attempted Solutions:**
1. Static `VIEWER_SLOT_MAP` mapped `Chest → 5`. Robes need slot 20 but our item data normalizes all chest items to `slot: "Chest"`, losing the distinction.
2. Used `slotId` from Wowhead XML as the viewer slot — but Wowhead returns `inventorySlot=5` for both chest pieces and robes, so this didn't help.
3. Updated `NOT_DISPLAYED_SLOTS` filter from `[2, 11, 12, 13, 14]` to `[2, 11, 12]` — this fixed weapons (InventoryType 13 = One-Hand) and shields (14) being incorrectly hidden when using real InventoryType values, but robes still broken.

**Final Solution:** Three-part fix:
1. The `/api/wowhead-display-id/[itemId]` route now probes the CDN with HEAD requests to resolve the actual slot. For chest items (`inventorySlot=5`), it tries `meta/armor/5/{displayId}.json` first — if 404, tries `meta/armor/20/{displayId}.json` (robe). HEAD requests work on zamimg CDN. The resolved slot is cached server-side.
2. The `useDisplayIds` hook now returns both `displayId` and `slotId` (as `DisplayInfo`), and `character-tab.tsx` uses `info.slotId` as the viewer slot instead of the static `VIEWER_SLOT_MAP` value.
3. Added `?v=2` cache-buster to the client-side fetch URL to invalidate browser-cached API responses (which had `Cache-Control: max-age=86400` with the old slotId=5 values).

**Insight:** Three key lessons:
- **Wowhead XML `inventorySlot` is the equipment slot, NOT the InventoryType.** It returns 5 for all chest items regardless of whether they're chest pieces or robes. The CDN uses the InventoryType (5 vs 20) for path routing, so the XML slot can't be trusted for the viewer.
- **When changing API response format, bust the browser cache.** A 24-hour `Cache-Control` means old responses persist even after server code changes. Version the fetch URL (`?v=2`) to force re-fetching.
- **`NOT_DISPLAYED_SLOTS` must match the slot ID system in use.** When switching from static `VIEWER_SLOT_MAP` values (where weapons were 21/22) to real InventoryTypes (where One-Hand=13, Shield=14), the non-visual slot filter must be updated — 13 and 14 are visual items (weapons/shields), only 2/11/12 (Neck/Finger/Trinket) are truly non-visual.
