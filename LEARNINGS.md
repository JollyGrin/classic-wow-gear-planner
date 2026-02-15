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
