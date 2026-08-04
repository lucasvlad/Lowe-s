// Shared by any card-like surface that wants the cork-board "pinned" look
// (currently components/listing.tsx and components/listing_detail_modal.tsx).
// See CLAUDE.md — this used to be duplicated per-component; consolidated here.

// Tuned to feel hand-pinned without looking chaotic — a wide rotation range
// and heavy opaque shadows were the biggest source of "looks cluttered"
// feedback on the original grid.
export const MAX_THUMBTACK_ROTATION_DEG = 8;

const REGULAR_THUMBTACKS = [
  require("../assets/images/thumbtacks/blue.png"),
  require("../assets/images/thumbtacks/green.png"),
  require("../assets/images/thumbtacks/pink.png"),
  require("../assets/images/thumbtacks/purple.png"),
  require("../assets/images/thumbtacks/red.png"),
  require("../assets/images/thumbtacks/yellow.png"),
];

// Special rare thumbtacks (1 in 300 chance each)
const SPECIAL_THUMBTACKS = [
  require("../assets/images/thumbtacks/rainbow.png"),
  require("../assets/images/thumbtacks/doge.png"),
];

// Simple string hash -> [0, 1), so the same id always maps to the same spot
// in that range (djb2-ish; doesn't need to be cryptographic, just stable).
function hashToUnitInterval(id: string): number {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) / 0xffffffff;
}

/**
 * Deterministic thumbtack for a given listing id — the same listing always
 * gets the same tack (color, and rare-tack odds) wherever it's shown, e.g.
 * the browse grid card and the listing detail popup.
 */
export function getThumbtackForId(id: string) {
  const t = hashToUnitInterval(id);

  // 1 in 300 chance for a rare special thumbtack.
  if (t < 1 / 300) {
    const idx = Math.floor((t / (1 / 300)) * SPECIAL_THUMBTACKS.length) % SPECIAL_THUMBTACKS.length;
    return SPECIAL_THUMBTACKS[idx];
  }

  const remaining = (t - 1 / 300) / (1 - 1 / 300);
  const idx = Math.floor(remaining * REGULAR_THUMBTACKS.length) % REGULAR_THUMBTACKS.length;
  return REGULAR_THUMBTACKS[idx];
}

export function getRandomThumbtackRotation(): number {
  return Math.random() * MAX_THUMBTACK_ROTATION_DEG * 2 - MAX_THUMBTACK_ROTATION_DEG;
}
