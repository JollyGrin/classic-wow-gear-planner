import * as react_jsx_runtime from 'react/jsx-runtime';

type Race = 'human' | 'orc' | 'dwarf' | 'nightelf' | 'undead' | 'tauren' | 'gnome' | 'troll' | 'bloodelf' | 'draenei';
type Gender = 0 | 1;
/** Wowhead inventory type IDs used by ZamModelViewer */
type SlotId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26;
/** Equipment entry: [inventoryType, wowheadDisplayId] */
type ItemEntry = [SlotId, number];
interface CameraState {
    azimuth: number;
    zenith: number;
    distance: number;
    zoomTarget: number;
    zoomCurrent: number;
}
interface DisplayInfo {
    displayId: number;
    slotId: number;
}
interface DisplayIdFetchOptions {
    /** Base URL for the display ID API endpoint. Default: '/api/wowhead-display-id' */
    baseUrl?: string;
}
interface WowModelViewerProps {
    /** CORS proxy base URL to wow.zamimg.com (required — forces consumers to set up their proxy) */
    contentPath: string;
    /** Character race (string for autocomplete, number for advanced) */
    race?: Race | number;
    /** 0=male, 1=female */
    gender?: Gender;
    /** Equipment as [inventoryType, wowheadDisplayId] pairs */
    items?: ItemEntry[];
    /** Canvas aspect ratio (must match CSS container). Default: 3/4 */
    aspect?: number;
    /** Default animation name. Default: 'Walk' */
    animation?: string;
    /** Show animation debug panel */
    debug?: boolean;
    /** CSS class on inner container */
    className?: string;
    /** Data environment. Default: 'classic' */
    dataEnv?: 'classic' | 'live';
    /** Fires when model loaded */
    onReady?: () => void;
    /** Fires on init failure */
    onError?: (err: Error) => void;
}
declare global {
    interface Window {
        jQuery: (selector: string) => unknown;
        ZamModelViewer: new (config: Record<string, unknown>) => Promise<ViewerInstance>;
        CONTENT_PATH: string;
        WOTLK_TO_RETAIL_DISPLAY_ID_API: string | undefined;
        WH: Record<string, unknown>;
    }
}
type ViewerInstance = {
    destroy?: () => void;
    renderer?: {
        actors?: any[];
        azimuth?: number;
        zenith?: number;
        distance?: number;
        crossFadeDuration?: number;
        zoom?: {
            target: number;
            current: number;
        };
    };
    method?: (name: string, ...args: unknown[]) => void;
};

declare function WowModelViewer({ contentPath, race, gender, items, aspect, animation, debug, className, dataEnv, onReady, onError, }: WowModelViewerProps): react_jsx_runtime.JSX.Element;

declare function AnimationDebugPanel({ viewer }: {
    viewer: ViewerInstance;
}): react_jsx_runtime.JSX.Element;

/** Fetch the Wowhead display info for a single item. Caches results. */
declare function fetchDisplayInfo(itemId: number, options?: DisplayIdFetchOptions): Promise<DisplayInfo>;
/**
 * Hook that resolves Wowhead display info for a set of item IDs.
 * Returns a map of itemId -> DisplayInfo, updating as results arrive.
 */
declare function useDisplayIds(itemIds: number[], options?: DisplayIdFetchOptions): {
    getDisplayInfo: (itemId: number) => DisplayInfo | null;
    displayInfos: Record<number, DisplayInfo>;
};

/** Normalized slot name -> ZamModelViewer inventory type ID.
 *  Slots 1-10 are the same as equipment slots. Back, weapons, and ranged
 *  use the WoW InventoryType enum (16, 21, 22, 26) which the viewer needs
 *  to pick the correct CDN path and body position. */
declare const VIEWER_SLOT_MAP: Record<string, number>;
/** Race name -> ZamModelViewer race ID */
declare const RACE_IDS: Record<string, number>;
/** Full WoW InventoryType enum as used by ZamModelViewer / WH.Wow.Item */
declare const INVENTORY_TYPE: {
    readonly HEAD: 1;
    readonly NECK: 2;
    readonly SHOULDERS: 3;
    readonly SHIRT: 4;
    readonly CHEST: 5;
    readonly WAIST: 6;
    readonly LEGS: 7;
    readonly FEET: 8;
    readonly WRISTS: 9;
    readonly HANDS: 10;
    readonly FINGER: 11;
    readonly TRINKET: 12;
    readonly ONE_HAND: 13;
    readonly SHIELD: 14;
    readonly RANGED: 15;
    readonly BACK: 16;
    readonly TWO_HAND: 17;
    readonly BAG: 18;
    readonly TABARD: 19;
    readonly ROBE: 20;
    readonly MAIN_HAND: 21;
    readonly OFF_HAND: 22;
    readonly HELD_IN_OFF_HAND: 23;
    readonly PROJECTILE: 24;
    readonly THROWN: 25;
    readonly RANGED_RIGHT: 26;
    readonly QUIVER: 27;
    readonly RELIC: 28;
};
/** Slots that have no visual representation on the 3D model */
declare const NOT_DISPLAYED_SLOTS: number[];

export { AnimationDebugPanel, type CameraState, type DisplayIdFetchOptions, type DisplayInfo, type Gender, INVENTORY_TYPE, type ItemEntry, NOT_DISPLAYED_SLOTS, RACE_IDS, type Race, type SlotId, VIEWER_SLOT_MAP, type ViewerInstance, WowModelViewer, type WowModelViewerProps, fetchDisplayInfo, useDisplayIds };
