"use client";

import type { CSSProperties } from "react";

/**
 * RulerEdge — decorative tick-mark rulers drawn along the top and right
 * edges of whatever relatively-positioned parent it's dropped into
 * (each layout's root `<div style={{position:'relative'}}>` on this
 * page). Because the strips are `position: absolute`, they scroll with
 * the page and sit *directly on* the grid background rather than
 * floating over the viewport as a fixed chrome overlay.
 *
 * Ticks are painted with two stacked linear gradients per strip:
 *   • MAJOR tick every 40 px (10 px long)
 *   • MINOR tick every  8 px ( 5 px long)
 * — so every fifth minor tick coincides with a major one, mimicking an
 * imperial ruler. Tiles anchor to the OUTER edge of each strip (top for
 * the horizontal ruler, right for the vertical one) so ticks hang
 * inward onto the grid.
 *
 * The strips are transparent apart from the ticks themselves, letting
 * the underlying grid lines show through unchanged. Colour comes from
 * `--ruler-ink` so dark-mode picks up automatically. `pointer-events`
 * is disabled so the ruler never eats clicks meant for the content
 * underneath.
 */
const THICKNESS = 20; // px — height (top strip) / width (right strip)
const MAJOR_LEN = 10; // px — length of a major tick
const MINOR_LEN = 5;  // px — length of a minor tick
const MAJOR_GAP = 40; // px — spacing between major ticks
const MINOR_GAP = 8;  // px — spacing between minor ticks (MAJOR_GAP / 5)

const base: CSSProperties = {
  position: "absolute",
  pointerEvents: "none",
  color: "var(--ruler-ink)",
  // Painted-only overlay — no tint, no border. The grid shows through.
  backgroundColor: "transparent",
};

export default function RulerEdge() {
  return (
    <>
      {/* ── Top ruler ─────────────────────────────────────────────────
         Each major/minor tile is MAJOR_GAP × MAJOR_LEN / MINOR_GAP ×
         MINOR_LEN; a 1 px stripe on the tile's LEFT edge becomes a
         vertical tick hanging from the strip's TOP edge. */}
      <div
        aria-hidden="true"
        style={{
          ...base,
          top: 0,
          left: 0,
          right: 0,
          height: THICKNESS,
          backgroundImage: [
            "linear-gradient(to right, currentColor 0 1px, transparent 1px 100%)",
            "linear-gradient(to right, currentColor 0 1px, transparent 1px 100%)",
          ].join(", "),
          backgroundSize: `${MAJOR_GAP}px ${MAJOR_LEN}px, ${MINOR_GAP}px ${MINOR_LEN}px`,
          backgroundPosition: "0 0, 0 0",
          backgroundRepeat: "repeat-x, repeat-x",
        }}
      />

      {/* ── Right ruler ───────────────────────────────────────────────
         Tiles are MAJOR_LEN × MAJOR_GAP / MINOR_LEN × MINOR_GAP; the
         1 px stripe on each tile's TOP edge becomes a horizontal tick
         extending inward from the strip's RIGHT edge. Strip stretches
         to the full height of its relative parent. */}
      <div
        aria-hidden="true"
        style={{
          ...base,
          top: 0,
          right: 0,
          bottom: 0,
          width: THICKNESS,
          backgroundImage: [
            "linear-gradient(to bottom, currentColor 0 1px, transparent 1px 100%)",
            "linear-gradient(to bottom, currentColor 0 1px, transparent 1px 100%)",
          ].join(", "),
          backgroundSize: `${MAJOR_LEN}px ${MAJOR_GAP}px, ${MINOR_LEN}px ${MINOR_GAP}px`,
          backgroundPosition: "100% 0, 100% 0",
          backgroundRepeat: "repeat-y, repeat-y",
        }}
      />
    </>
  );
}
