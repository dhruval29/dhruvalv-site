"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * MechSpringCanvas — scroll-driven spring-mass oscillator on a <canvas>.
 *
 * The block sits at its natural equilibrium until the user scrolls.
 * Each scroll event is converted into a velocity impulse on the block:
 * scrolling DOWN kicks the block toward the wall (compression),
 * scrolling UP kicks it away. A Hooke's-law restoring force pulls the
 * block back to equilibrium every frame, and the block's momentum
 * makes it overshoot and oscillate (the "fire-back"). Damping bleeds
 * the energy out so the scene comes to rest when scrolling stops.
 *
 * The canvas draws in a fixed 680×280 logical coordinate system; a
 * ResizeObserver keeps the backing bitmap sized to the displayed box ×
 * devicePixelRatio so the rendering stays crisp on hi-DPI screens.
 *
 * Honours `prefers-reduced-motion`: scroll hooks are skipped and the
 * scene is drawn once at equilibrium.
 */
const LOGICAL_W = 680;
const LOGICAL_H = 280;

/** Hooke constant (per frame²). Higher = stiffer spring = faster return.
 *  Lowered from 0.05 → 0.032 so each swing takes longer (period ~= 2π/√k
 *  ≈ 35 frames ≈ 0.58 s at 60 fps). */
const STIFFNESS = 0.032;
/** Multiplicative velocity damping per frame. <1 = loses energy.
 *  0.92 bleeds energy about 3× faster than the previous 0.955, so the
 *  block settles in under a second (10% energy left after ~28 frames)
 *  while still allowing one visible overshoot on the fire-back. */
const DAMPING = 0.92;
/** How much each pixel of scroll delta kicks the block's velocity.
 *  Slightly higher to keep the kick feel punchy with the softer spring. */
const SCROLL_IMPULSE = 0.22;
/** Clamp a single scroll event so one big wheel-tick can't slingshot. */
const MAX_IMPULSE_DELTA = 120;

export default function MechSpringCanvas({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const groundY = 210;
    const wallX = 80;
    const wallW = 30;
    const wallH = 130;
    const wallTop = groundY - wallH;
    const blockW = 90;
    const blockH = 60;
    const blockY = groundY - blockH;
    const springAnchorX = wallX + wallW;
    const equilibrium = 340;

    // Travel bounds in logical coords. MIN keeps a few coils visible
    // (block-left never reaches the wall face); MAX keeps the block
    // inside the canvas even after big scroll-up kicks.
    const MIN_X = springAnchorX + 60;
    const MAX_X = LOGICAL_W - blockW - 30;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Keep the backing bitmap sized to the displayed box × DPR so the
    // drawing stays sharp. We always draw in logical 680×280 coords and
    // let setTransform stretch to fit the current display rect.
    function sizeCanvas() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(
        (rect.width * dpr) / LOGICAL_W,
        0,
        0,
        (rect.height * dpr) / LOGICAL_H,
        0,
        0,
      );
    }

    function drawSpring(x0: number, x1: number, y: number) {
      if (!ctx) return;
      const coils = 10;
      const coilW = 12;
      const straight = 18;

      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x0 + straight, y);

      const coilStart = x0 + straight;
      const coilEnd = x1 - straight;
      const coilLen = coilEnd - coilStart;
      const steps = coils * 2;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = coilStart + t * coilLen;
        const cy = y + (i % 2 === 0 ? -coilW : coilW);
        ctx.lineTo(cx, cy);
      }

      ctx.lineTo(x1, y);

      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function drawScene(blockX: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

      // Ground / platform
      ctx.fillStyle = "#e8e6de";
      ctx.fillRect(wallX, groundY, LOGICAL_W - wallX - 30, 6);
      ctx.fillStyle = "#d0cfc8";
      ctx.fillRect(wallX, groundY + 6, LOGICAL_W - wallX - 30, 16);

      // Wall hatch (angled cross-hatching behind the wall)
      ctx.save();
      ctx.beginPath();
      ctx.rect(wallX - 20, wallTop - 10, 24, wallH + 10);
      ctx.clip();
      ctx.strokeStyle = "#bbb";
      ctx.lineWidth = 1;
      for (let i = -wallH; i < wallH + 20; i += 8) {
        ctx.beginPath();
        ctx.moveTo(wallX - 20, wallTop + i);
        ctx.lineTo(wallX + 10, wallTop + i - 30);
        ctx.stroke();
      }
      ctx.restore();

      // Wall body
      ctx.fillStyle = "#8B6543";
      ctx.beginPath();
      ctx.roundRect(wallX, wallTop, wallW, wallH, 2);
      ctx.fill();
      // Wall face highlight
      ctx.fillStyle = "#a07850";
      ctx.fillRect(wallX + wallW - 6, wallTop, 6, wallH);

      // Spring — from wall face to block left face
      const springY = blockY + blockH / 2;
      drawSpring(springAnchorX, blockX, springY);

      // Equilibrium dashed reference line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(springAnchorX, springY);
      ctx.lineTo(LOGICAL_W - 40, springY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Block
      ctx.fillStyle = "#CC3333";
      ctx.beginPath();
      ctx.roundRect(blockX, blockY, blockW, blockH, 8);
      ctx.fill();
    }

    let rafId = 0;
    let cancelled = false;

    // Physics state for the block.
    let pos = equilibrium;
    let vel = 0;
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    // When the block is essentially at rest and no scroll is happening,
    // pause the RAF loop to avoid burning a CPU core on a static scene.
    let idleFrames = 0;
    const IDLE_THRESHOLD = 30;

    function onScroll() {
      if (!canvas) return;
      const sy = window.scrollY;
      const delta = sy - lastScrollY;
      lastScrollY = sy;

      // Skip the kick entirely if the canvas isn't close to the viewport.
      const rect = canvas.getBoundingClientRect();
      const inView = rect.bottom > -200 && rect.top < window.innerHeight + 200;
      if (!inView) return;

      const capped = Math.max(
        -MAX_IMPULSE_DELTA,
        Math.min(MAX_IMPULSE_DELTA, delta),
      );
      // Scroll DOWN (capped > 0) ⇒ block pushed LEFT toward the wall.
      vel -= capped * SCROLL_IMPULSE;

      // Wake the RAF loop if it had gone to sleep.
      if (rafId === 0 && !cancelled && !reduceMotion) {
        idleFrames = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      if (cancelled) return;

      // Hooke's law: F = -k(x - x_eq). Integrate with simple Euler — at
      // 60 fps the numbers are tame enough that it's stable and readable.
      const springForce = -STIFFNESS * (pos - equilibrium);
      vel += springForce;
      vel *= DAMPING;
      pos += vel;

      // Soft wall collisions so frantic scrolling can't slingshot the
      // block outside the canvas; bleed most of the energy on contact.
      if (pos < MIN_X) {
        pos = MIN_X;
        vel = Math.abs(vel) * 0.35;
      } else if (pos > MAX_X) {
        pos = MAX_X;
        vel = -Math.abs(vel) * 0.35;
      }

      drawScene(pos);

      // Sleep the loop once the block has clearly settled at rest.
      if (Math.abs(vel) < 0.02 && Math.abs(pos - equilibrium) < 0.3) {
        idleFrames += 1;
        if (idleFrames > IDLE_THRESHOLD) {
          pos = equilibrium;
          vel = 0;
          drawScene(pos);
          rafId = 0;
          return;
        }
      } else {
        idleFrames = 0;
      }

      rafId = requestAnimationFrame(tick);
    }

    sizeCanvas();
    if (reduceMotion) {
      drawScene(equilibrium);
    } else {
      drawScene(pos);
      rafId = requestAnimationFrame(tick);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Redraw on resize so the bitmap stays sharp.
    const ro = new ResizeObserver(() => {
      sizeCanvas();
      drawScene(reduceMotion ? equilibrium : pos);
    });
    ro.observe(canvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      if (!reduceMotion) window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}
