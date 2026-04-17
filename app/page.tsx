"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/**
 * Personal portfolio page
 *
 * Two canvases share the same app state (theme + smooth scroll):
 *   • DesktopLayout  → Figma node 42:349   (1536 px reference canvas)
 *   • MobileLayout   → Figma node 93:2     (~402 px reference canvas)
 *
 * The two variants live side-by-side in the DOM; CSS media queries
 * (see `layout-desktop` / `layout-mobile` in globals.css) decide which
 * is visible. This keeps SSR stable and lets every sub-tree animate
 * in at its own cadence once it enters the viewport.
 *
 * Responsive conversion rule (applied in both layouts):
 *   x / ref × 100  → %          (horizontal positions)
 *   y / ref × 100  → vw         (vertical positions & heights)
 *   font / ref ×100 → vw        (typography scales with viewport)
 */

const NAV_LINKS = ["ABOUT", "PROJECTS", "SKILLS", "CONTACT"] as const;

/* ─────────────────────────────────────────────────────────────────────────
   Scroll-reveal hook
   Observes an element and animates it in when it enters the viewport.
   ───────────────────────────────────────────────────────────────────── */
function useReveal<T extends HTMLElement>(
  delay = 0,
  dir: "up" | "left" | "right" | "fade" = "up"
) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden: Record<string, React.CSSProperties> = {
    up:    { opacity: 0, transform: "translateY(2.5vw)" },
    left:  { opacity: 0, transform: "translateX(-3vw)" },
    right: { opacity: 0, transform: "translateX(3vw)" },
    fade:  { opacity: 0, transform: "translateY(0)" },
  };

  return {
    ref,
    anim: {
      ...(visible ? { opacity: 1, transform: "translateY(0) translateX(0)" } : hidden[dir]),
      transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    } as React.CSSProperties,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   CornerDots — four small squares inset into each corner of a nav button.
   Sized by parent via CSS length props so both desktop & mobile can reuse.
   ───────────────────────────────────────────────────────────────────── */
function CornerDots({
  size = "0.20vw",
  inset = "0.20vw",
}: {
  size?: string;
  inset?: string;
}) {
  const shared: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    background: "#514532",
  };
  return (
    <>
      <span style={{ ...shared, top: inset, left: inset }} />
      <span style={{ ...shared, bottom: inset, left: inset }} />
      <span style={{ ...shared, bottom: inset, right: inset }} />
      <span style={{ ...shared, top: inset, right: inset }} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   ThemeLever — "Toggle System Illumination" switch.
   Internals use `em` units so the whole widget scales with the container's
   `fontSize`. Pass fontSize = container width (in vw) and everything else
   (borders, slot, handle, grip stripes) resizes proportionally. This lets
   the same component serve desktop (≈58 px wide) and mobile (≈44 px wide).
   ───────────────────────────────────────────────────────────────────── */
function ThemeLever({
  isDark,
  toggle,
  left,
  top,
  width,
  fontSize,
  delay = 0.08,
}: {
  isDark: boolean;
  toggle: () => void;
  left: string;
  top: string;
  width: string;
  /** Length-unit setter for all internal `em`-based sizes (use container width in vw). */
  fontSize: string;
  delay?: number;
}) {
  const reveal = useReveal<HTMLDivElement>(delay, "up");

  return (
    <div
      ref={reveal.ref}
      className="toggle-btn"
      onClick={toggle}
      title="Toggle System Illumination"
      style={{
        position: "absolute",
        left,
        top,
        width,
        fontSize,
        cursor: "pointer",
        userSelect: "none",
        ...reveal.anim,
      }}
    >
      {/* ── Lever body ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          border: `0.045em solid ${isDark ? "#353535" : "#d5c4ab"}`,
          background: isDark ? "#1a1a1a" : "#e5e2e1",
          width: "100%",
          paddingTop: "145%",
          boxShadow: isDark
            ? "inset 0 0.068em 0.137em rgba(0,0,0,0.8), 0 0.018em 0.018em rgba(255,255,255,0.05)"
            : "inset 0 0.034em 0.068em rgba(0,0,0,0.15), 0 0.018em 0.018em rgba(255,255,255,0.8)",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* ── Slot (vertical track) ─────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: "0.174em",
            bottom: "0.174em",
            left: "50%",
            transform: "translateX(-50%)",
            width: "27%",
            borderRadius: "0.132em",
            background: isDark ? "#0a0a0a" : "#b8b2a8",
            boxShadow: isDark
              ? "inset 0 0.034em 0.068em rgba(0,0,0,1)"
              : "inset 0 0.034em 0.068em rgba(0,0,0,0.25)",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              width: "0.068em",
              height: "100%",
              background: isDark
                ? "linear-gradient(90deg, #444 0%, #888 50%, #444 100%)"
                : "linear-gradient(90deg, #888 0%, #514532 50%, #888 100%)",
              boxShadow: "0 0 0.045em rgba(0,0,0,0.5)",
              transition: "background 0.3s",
            }}
          />
        </div>

        {/* ── Handle (red pill that slides up/down) ─────────────── */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: `translateX(-50%) translateY(${isDark ? "0.089em" : "0.816em"})`,
            transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            width: "55%",
            height: "0.363em",
            background: "linear-gradient(180deg, #8b0000 0%, #600000 100%)",
            border: "0.024em solid #412d00",
            borderRadius: "0.045em",
            boxShadow: "0 0.090em 0.179em rgba(0,0,0,0.6)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
            }}
          />
        </div>

        {/* ── Inner shadow overlay ──────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0.068em 0.137em rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   DESKTOP-ONLY sub-components
   ═════════════════════════════════════════════════════════════════════════ */

/** Double-headed arrow dimension line matching the Figma annotation style */
function DimLine({
  type,
  value,
  bg,
  isDark,
}: {
  type: "horizontal" | "vertical";
  value: number;
  bg: string;
  isDark: boolean;
}) {
  const reveal = useReveal<HTMLDivElement>(type === "horizontal" ? 0.2 : 0.26, "fade");
  const color = isDark ? "#FFB800" : "#000000";
  const arrowSize = "0.39vw";
  const lineThick = "2px";
  const font: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: "0.59vw",
    color,
    background: bg,
    padding: "0 0.26vw",
    whiteSpace: "nowrap",
    lineHeight: 1,
    transition: "background 0.3s",
  };

  if (type === "horizontal") {
    return (
      <div
        ref={reveal.ref}
        style={{
          position: "absolute",
          top: "calc(100% + 0.78vw)",
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          height: "1vw",
          pointerEvents: "none",
          ...reveal.anim,
        }}
      >
        <div style={{ width: 0, height: 0, borderTop: `${arrowSize} solid transparent`, borderBottom: `${arrowSize} solid transparent`, borderRight: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
        <div style={{ flex: 1, height: lineThick, background: color }} />
        <span style={font}>{value}px</span>
        <div style={{ flex: 1, height: lineThick, background: color }} />
        <div style={{ width: 0, height: 0, borderTop: `${arrowSize} solid transparent`, borderBottom: `${arrowSize} solid transparent`, borderLeft: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
      </div>
    );
  }

  return (
    <div
      ref={reveal.ref}
      style={{
        position: "absolute",
        left: "calc(100% + 0.52vw)",
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "2vw",
        pointerEvents: "none",
        ...reveal.anim,
      }}
    >
      <div style={{ width: 0, height: 0, borderLeft: `${arrowSize} solid transparent`, borderRight: `${arrowSize} solid transparent`, borderBottom: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
      <div style={{ flex: 1, width: lineThick, background: color }} />
      <span
        style={{
          ...font,
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          padding: "0.26vw 0",
        }}
      >
        {value}px
      </span>
      <div style={{ flex: 1, width: lineThick, background: color }} />
      <div style={{ width: 0, height: 0, borderLeft: `${arrowSize} solid transparent`, borderRight: `${arrowSize} solid transparent`, borderTop: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
    </div>
  );
}

/** Profile photo with live dimension annotations (Figma-style) — desktop only */
function PhotoWithDimensions({ bg, isDark }: { bg: string; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reveal = useReveal<HTMLDivElement>(0.16, "right");
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setDims({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={reveal.ref}
      style={{
        position: "absolute",
        left: "68.81%",
        top: "13.28vw",
        width: "24%",
        height: "27.95vw",
        ...reveal.anim,
      }}
    >
      <div
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "2.66%",
          overflow: "hidden",
        }}
      >
        <Image
          src="/profile.jpg"
          alt="Dhruval J. Vashi"
          fill
          style={{ objectFit: "cover", objectPosition: "42% top" }}
          priority
        />
      </div>

      {dims.w > 0 && <DimLine type="horizontal" value={dims.w} bg={bg} isDark={isDark} />}
      {dims.h > 0 && <DimLine type="vertical" value={dims.h} bg={bg} isDark={isDark} />}
    </div>
  );
}

/** Desktop: India flag accent beside the "Vashi" name line */
function NameFlag({ isDark }: { isDark: boolean }) {
  const poleReveal = useReveal<HTMLDivElement>(0.18, "up");
  const flagReveal = useReveal<HTMLDivElement>(0.26, "up");

  return (
    <>
      <div
        ref={poleReveal.ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "22.10%",
          top: "21.09vw",
          width: "0.10vw",
          height: "4.69vw",
          background: isDark ? "#ffffff" : "#000000",
          ...poleReveal.anim,
        }}
      />

      <div
        ref={flagReveal.ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "23.05%",
          top: "21.62vw",
          width: "5.60%",
          height: "3.71vw",
          overflow: "hidden",
          ...flagReveal.anim,
        }}
      >
        <Image
          src="/Flag_of_India.svg.png"
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   DESKTOP LAYOUT
   Reference canvas: 1536 px × ~1560 px  (Figma node 42-349)
   ═════════════════════════════════════════════════════════════════════════ */
function DesktopLayout({
  isDark,
  toggle,
  scrollToId,
  bg,
}: {
  isDark: boolean;
  toggle: () => void;
  scrollToId: (id: string) => void;
  bg: string;
}) {
  const rNav       = useReveal<HTMLElement>(0.06, "up");
  const rName      = useReveal<HTMLDivElement>(0.15, "up");
  const rSubtitle  = useReveal<HTMLDivElement>(0.35, "up");
  const rAboutHead = useReveal<HTMLParagraphElement>(0, "left");
  const rAboutP1   = useReveal<HTMLParagraphElement>(0.12, "up");
  const rAboutP23  = useReveal<HTMLDivElement>(0.22, "up");
  const rEduHead   = useReveal<HTMLParagraphElement>(0, "left");
  const rNitg      = useReveal<HTMLDivElement>(0.08, "fade");
  const rCamera    = useReveal<HTMLDivElement>(0.10, "left");
  const rInst      = useReveal<HTMLParagraphElement>(0.14, "up");
  const rDegree    = useReveal<HTMLParagraphElement>(0.20, "up");
  const rYear      = useReveal<HTMLParagraphElement>(0.14, "right");

  return (
    <div style={{ position: "relative", width: "100%", height: "106vw" }}>
      {/* Invisible anchors so nav links always work */}
      <div id="projects" aria-hidden="true" style={{ position: "absolute", left: 0, top: "78vw", width: 1, height: 1 }} />
      <div id="skills" aria-hidden="true" style={{ position: "absolute", left: 0, top: "92vw", width: 1, height: 1 }} />
      <div id="contact" aria-hidden="true" style={{ position: "absolute", left: 0, top: "104vw", width: 1, height: 1 }} />

      {/* ── Grid background ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), " +
            "linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "2.34vw 2.34vw",
          transition: "background-image 0.3s",
        }}
      />

      {/* ── Navigation bar ──────────────────────────────────────────── */}
      <nav
        ref={rNav.ref}
        style={{
          position: "absolute",
          left: "28.13%",
          top: "2.90vw",
          width: "38.51%",
          display: "flex",
          gap: "1.30vw",
          ...rNav.anim,
        }}
      >
        {NAV_LINKS.map((label) => (
          <a
            key={label}
            className="nav-btn"
            href={`#${label.toLowerCase()}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(label.toLowerCase());
            }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              background: "#ffb800",
              border: "0.20vw solid #353535",
              padding: "1.01vw 0",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 700,
              fontSize: "1.11vw",
              letterSpacing: "0.11vw",
              textTransform: "uppercase",
              color: "#000",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
            <CornerDots size="0.20vw" inset="0.20vw" />
          </a>
        ))}
      </nav>

      {/* ── Theme lever ─────────────────────────────────────────────── */}
      <ThemeLever
        isDark={isDark}
        toggle={toggle}
        left="92.20%"
        top="2.01vw"
        width="3.80%"
        fontSize="3.80vw"
      />

      {/* ── Name "Dhruval J. / Vashi" ───────────────────────────────── */}
      <div
        ref={rName.ref}
        style={{
          position: "absolute",
          left: "7.36%",
          top: "16.15vw",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 900,
          fontSize: "4.69vw",
          lineHeight: 1.03,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rName.anim,
        }}
      >
        <p style={{ margin: 0 }}>Dhruval J.</p>
        <p style={{ margin: 0 }}>Vashi</p>
      </div>
      <NameFlag isDark={isDark} />

      {/* ── Subtitle ────────────────────────────────────────────────── */}
      <div
        ref={rSubtitle.ref}
        style={{
          position: "absolute",
          left: "7.36%",
          top: "27.21vw",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "3.26vw",
          lineHeight: 1.03,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rSubtitle.anim,
        }}
      >
        <p style={{ margin: 0 }}>{"Engineer, Av-Geek & "}</p>
        <p style={{ margin: 0 }}>Photographer</p>
      </div>

      {/* ── Profile photo + live dimension annotations ─────────────── */}
      <PhotoWithDimensions bg={bg} isDark={isDark} />

      {/* ── Gear (partially clipped, slowly rotating) ───────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-16.90%",
          top: "-22.90vw",
          width: "45.64%",
          height: "45.05vw",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "23.66% 23.26%",
            animation: "spin-slow 12s linear infinite",
            transformOrigin: "center center",
          }}
        >
          <Image src="/6326.svg" alt="" fill style={{ objectFit: "contain" }} />
        </div>
      </div>

      {/* ── Camera decoration (bottom-left) ─────────────────────────── */}
      <div
        ref={rCamera.ref}
        className="camera-deco"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-4.49%",
          top: "32.03vw",
          width: "25.21%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto",
          ...rCamera.anim,
        }}
      >
        <div style={{ position: "relative", width: "81.07%", height: "81.07%" }}>
          <Image
            className="camera-deco-img"
            src="/camera.png"
            alt=""
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ABOUT
         ═══════════════════════════════════════════════════════════════ */}
      <p
        id="about"
        ref={rAboutHead.ref}
        style={{
          position: "absolute",
          left: "7.68%",
          top: "56.90vw",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 700,
          fontSize: "3.13vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rAboutHead.anim,
        }}
      >
        ABOUT
      </p>

      <p
        ref={rAboutP1.ref}
        style={{
          position: "absolute",
          left: "7.68%",
          top: "62.82vw",
          width: "74.67%",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "2.08vw",
          lineHeight: 1.11,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rAboutP1.anim,
        }}
      >
        When I was younger , always loved to tinker with things that move,
        my dad got me a MECHANIX set &amp; I used to spend hours working on that.
      </p>

      <div
        ref={rAboutP23.ref}
        style={{
          position: "absolute",
          left: "7.68%",
          top: "70.31vw",
          width: "74.67%",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "2.08vw",
          lineHeight: 1.11,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rAboutP23.anim,
        }}
      >
        <p style={{ margin: 0 }}>
          Living next to an Airport, made me fascinated about planes, that such
          a humongous thing can fly.
        </p>
        <p style={{ margin: "1.30vw 0 0" }}>
          My love for photography originated during my early teens exploring the
          Pro mode on the camera spending countless hours , taking pictures of
          clouds and sky , perfecting each and every setting over the years
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          EDUCATION
         ═══════════════════════════════════════════════════════════════ */}
      <p
        id="education"
        ref={rEduHead.ref}
        style={{
          position: "absolute",
          left: "7.68%",
          top: "89.13vw",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 700,
          fontSize: "3.13vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rEduHead.anim,
        }}
      >
        EDUCATION
      </p>

      <div
        ref={rNitg.ref}
        style={{
          position: "absolute",
          left: "6.90%",
          top: "94.73vw",
          width: "4.94%",
          height: "4.98vw",
          ...rNitg.anim,
        }}
      >
        <Image
          src="/nitg-logo.png"
          alt="NIT Goa logo"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      <p
        ref={rInst.ref}
        style={{
          position: "absolute",
          left: "13.61%",
          top: "94.99vw",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 700,
          fontSize: "2.21vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rInst.anim,
        }}
      >
        National Institute of Technology, Goa
      </p>

      <p
        ref={rDegree.ref}
        style={{
          position: "absolute",
          left: "13.48%",
          top: "97.66vw",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "2.08vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rDegree.anim,
        }}
      >
        Bachelors in Technology, Mechanical Engineering
      </p>

      <p
        ref={rYear.ref}
        style={{
          position: "absolute",
          left: "77.02%",
          top: "95.25vw",
          margin: 0,
          fontFamily: "var(--font-montserrat), sans-serif",
          fontWeight: 300,
          fontSize: "2.08vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rYear.anim,
        }}
      >
        2023-27
      </p>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   MOBILE LAYOUT
   Reference canvas: 402 px wide × ~1700 px tall  (Figma node 93:2)

   All horizontal positions are % of the 402 px reference frame and all
   vertical positions / font sizes are vw of the same reference, so every
   element scales fluidly with the device width — iPhone SE (320 px) up
   through iPhone 16 Plus (430 px) and beyond.
   ═════════════════════════════════════════════════════════════════════════ */
function MobileLayout({
  isDark,
  toggle,
  scrollToId,
}: {
  isDark: boolean;
  toggle: () => void;
  scrollToId: (id: string) => void;
}) {
  // Reveal handles — one per animated element
  const rName      = useReveal<HTMLDivElement>(0.10, "up");
  const rPole      = useReveal<HTMLDivElement>(0.18, "up");
  const rFlag      = useReveal<HTMLDivElement>(0.26, "up");
  const rPhoto     = useReveal<HTMLDivElement>(0.14, "up");
  const rSubtitle  = useReveal<HTMLDivElement>(0.30, "up");
  const rNavSkills    = useReveal<HTMLAnchorElement>(0.06, "up");
  const rNavAbout     = useReveal<HTMLAnchorElement>(0.14, "up");
  const rNavContact   = useReveal<HTMLAnchorElement>(0.22, "up");
  const rNavProjects  = useReveal<HTMLAnchorElement>(0.30, "up");
  const rAboutHead = useReveal<HTMLParagraphElement>(0,    "left");
  const rAboutP1   = useReveal<HTMLParagraphElement>(0.12, "up");
  const rAboutP2   = useReveal<HTMLParagraphElement>(0.22, "up");
  const rEduHead   = useReveal<HTMLParagraphElement>(0,    "left");
  const rNitg      = useReveal<HTMLDivElement>(0.08, "fade");
  const rEduBlock  = useReveal<HTMLDivElement>(0.14, "right");

  // Shared typography
  const fontFamily = "var(--font-montserrat), sans-serif";

  // Nav button factory (all four share the same chrome)
  const navButton = (
    label: string,
    href: string,
    left: string,
    top: string,
    width: string,
    height: string,
    reveal: { ref: React.Ref<HTMLAnchorElement>; anim: React.CSSProperties }
  ) => (
    <a
      key={label}
      ref={reveal.ref}
      className="nav-btn"
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollToId(href.slice(1));
      }}
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        background: "#ffb800",
        border: "0.464vw solid #353535",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
        fontWeight: 700,
        fontSize: "2.55vw",
        letterSpacing: "0.26vw",
        textTransform: "uppercase",
        color: "#000",
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...reveal.anim,
      }}
    >
      {label}
      <CornerDots size="0.464vw" inset="0.464vw" />
    </a>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "430vw" }}>
      {/* Invisible anchors so the SKILLS/PROJECTS/CONTACT buttons still scroll. */}
      <div id="projects" aria-hidden="true" style={{ position: "absolute", left: 0, top: "310vw", width: 1, height: 1 }} />
      <div id="skills"   aria-hidden="true" style={{ position: "absolute", left: 0, top: "350vw", width: 1, height: 1 }} />
      <div id="contact"  aria-hidden="true" style={{ position: "absolute", left: 0, top: "420vw", width: 1, height: 1 }} />

      {/* ── Grid background ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), " +
            "linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "5.97vw 5.97vw",
          transition: "background-image 0.3s",
        }}
      />

      {/* ── Gear (top-left, partially clipped, slowly rotating) ─────── */}
      {/*   Outer: left -224/402 = -55.72%, top -337/402 = -83.83vw      */}
      {/*   Outer size: 560.8/402 = 139.50% wide, 553.6/402 = 137.71vw   */}
      {/*   Inner inset matches Figma (group bounds inside artwork)      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-55.72%",
          top: "-83.83vw",
          width: "139.50%",
          height: "137.71vw",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "31.94%",
            left: "12.70%",
            right: "33.83%",
            bottom: "15.38%",
            animation: "spin-slow 12s linear infinite",
            transformOrigin: "center center",
          }}
        >
          <Image src="/6326.svg" alt="" fill style={{ objectFit: "contain" }} />
        </div>
      </div>

      {/* ── Theme lever — "Toggle System Illumination" ──────────────── */}
      {/*   left 315/402 = 78.36%, top 38/402 = 9.45vw                   */}
      {/*   width 44/402 = 10.95% (height = 15.92vw via 145% padding-top) */}
      <ThemeLever
        isDark={isDark}
        toggle={toggle}
        left="78.36%"
        top="9.45vw"
        width="10.95%"
        fontSize="10.95vw"
        delay={0.05}
      />

      {/* ── Profile photo ───────────────────────────────────────────── */}
      {/*   left 99/402=24.63%, top 153/402=38.06vw                      */}
      {/*   width 197.744/402=49.19%, height 230.303/402=57.29vw         */}
      {/*   radius 5.267/402=1.31vw                                      */}
      <div
        ref={rPhoto.ref}
        style={{
          position: "absolute",
          left: "24.63%",
          top: "38.06vw",
          width: "49.19%",
          height: "57.29vw",
          borderRadius: "1.31vw",
          overflow: "hidden",
          ...rPhoto.anim,
        }}
      >
        <Image
          src="/profile.jpg"
          alt="Dhruval J. Vashi"
          fill
          style={{ objectFit: "cover", objectPosition: "42% top" }}
          priority
        />
      </div>

      {/* ── Name "Dhruval J. / Vashi" ───────────────────────────────── */}
      {/*   left 94/402=23.38%, top 427/402=106.22vw, font 40/402=9.95vw */}
      <div
        ref={rName.ref}
        style={{
          position: "absolute",
          left: "23.38%",
          top: "106.22vw",
          fontFamily,
          fontWeight: 900,
          fontSize: "9.95vw",
          lineHeight: 1,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rName.anim,
        }}
      >
        <p style={{ margin: 0 }}>Dhruval J.</p>
        <p style={{ margin: 0 }}>Vashi</p>
      </div>

      {/* ── Flag pole beside "Vashi" ────────────────────────────────── */}
      {/*   pole: x=221/402=54.98%, y=467/402=116.17vw, h=36/402=8.96vw  */}
      <div
        ref={rPole.ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "54.98%",
          top: "116.17vw",
          width: "0.37vw",
          height: "8.96vw",
          background: isDark ? "#ffffff" : "#000000",
          ...rPole.anim,
        }}
      />

      {/* ── Flag (India) ────────────────────────────────────────────── */}
      {/*   flag: x=237/402=58.96%, y=468/402=116.42vw                   */}
      {/*   size: 49.536/402=12.32% × 32.832/402=8.17vw                  */}
      <div
        ref={rFlag.ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "58.96%",
          top: "116.42vw",
          width: "12.32%",
          height: "8.17vw",
          overflow: "hidden",
          ...rFlag.anim,
        }}
      >
        <Image
          src="/Flag_of_India.svg.png"
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* ── Subtitle ────────────────────────────────────────────────── */}
      {/*   left 85/402=21.14%, top 542/402=134.83vw, font 24/402=5.97vw */}
      <div
        ref={rSubtitle.ref}
        style={{
          position: "absolute",
          left: "21.14%",
          top: "134.83vw",
          fontFamily,
          fontWeight: 300,
          fontSize: "5.97vw",
          lineHeight: 1.28,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rSubtitle.anim,
        }}
      >
        <p style={{ margin: 0 }}>{"Engineer, Av-Geek & "}</p>
        <p style={{ margin: 0 }}>Photographer</p>
      </div>

      {/* ── Navigation (3-up row + 1 centered below) ────────────────── */}
      {/*   Row 1 (top 688/402=171.14vw):                                */}
      {/*     SKILLS  x=44/402=10.95% w=78/402=19.40% h=38/402=9.45vw    */}
      {/*     ABOUT   x=158/402=39.30% w=81/402=20.15% h=39/402=9.70vw   */}
      {/*     CONTACT x=275/402=68.41% w=94/402=23.38% h=39/402=9.70vw   */}
      {/*   Row 2 (top 764/402=190.05vw):                                */}
      {/*     PROJECTS x=148/402=36.82% w=101/402=25.12% h=38/402=9.45vw */}
      {navButton("SKILLS",   "#skills",   "10.95%", "171.14vw", "19.40%", "9.45vw", rNavSkills)}
      {navButton("ABOUT",    "#about",    "39.30%", "171.14vw", "20.15%", "9.70vw", rNavAbout)}
      {navButton("CONTACT",  "#contact",  "68.41%", "171.14vw", "23.38%", "9.70vw", rNavContact)}
      {navButton("PROJECTS", "#projects", "36.82%", "190.05vw", "25.12%", "9.45vw", rNavProjects)}

      {/* ═══════════════════════════════════════════════════════════════
          ABOUT
          heading top 920/402 = 228.86vw
         ═══════════════════════════════════════════════════════════════ */}
      <p
        id="about"
        ref={rAboutHead.ref}
        style={{
          position: "absolute",
          left: "9.70%",
          top: "228.86vw",
          margin: 0,
          fontFamily,
          fontWeight: 700,
          fontSize: "7.96vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rAboutHead.anim,
        }}
      >
        ABOUT
      </p>

      {/* About paragraph 1 — top 1011/402 = 251.49vw, width 330/402=82.09% */}
      <p
        ref={rAboutP1.ref}
        style={{
          position: "absolute",
          left: "9.70%",
          top: "251.49vw",
          width: "82.09%",
          margin: 0,
          fontFamily,
          fontWeight: 300,
          fontSize: "5.97vw",
          lineHeight: 1.12,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rAboutP1.anim,
        }}
      >
        When I was younger , always loved to tinker with things that move, my dad got me a MECHANIX set &amp; I used to spend hours working on that.
      </p>

      {/* About paragraph 2 — top 1202/402 = 299.00vw, width 364/402=90.55% */}
      <p
        ref={rAboutP2.ref}
        style={{
          position: "absolute",
          left: "9.70%",
          top: "299.00vw",
          width: "90.55%",
          margin: 0,
          fontFamily,
          fontWeight: 300,
          fontSize: "5.97vw",
          lineHeight: 1.12,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rAboutP2.anim,
        }}
      >
        Living next to an Airport, made me fascinated about planes, that such a humongous thing can fly.
      </p>

      {/* ═══════════════════════════════════════════════════════════════
          EDUCATION
          heading top 1424/402 = 354.23vw
         ═══════════════════════════════════════════════════════════════ */}
      <p
        id="education"
        ref={rEduHead.ref}
        style={{
          position: "absolute",
          left: "8.96%",
          top: "354.23vw",
          margin: 0,
          fontFamily,
          fontWeight: 700,
          fontSize: "7.96vw",
          lineHeight: 1.01,
          color: "var(--foreground)",
          whiteSpace: "nowrap",
          transition: "color 0.3s",
          ...rEduHead.anim,
        }}
      >
        EDUCATION
      </p>

      {/* NIT Goa logo — left 39/402=9.70%, top 1480/402=368.16vw, 48×48 */}
      <div
        ref={rNitg.ref}
        style={{
          position: "absolute",
          left: "9.70%",
          top: "368.16vw",
          width: "11.94%",
          height: "11.94vw",
          ...rNitg.anim,
        }}
      >
        <Image
          src="/nitg-logo.png"
          alt="NIT Goa logo"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Institution block — stacked: name (16), year (12), degree (16) */}
      {/*   left 39/402=9.70%, top 1542/402=383.58vw, width 299/402=74.38% */}
      <div
        ref={rEduBlock.ref}
        style={{
          position: "absolute",
          left: "9.70%",
          top: "383.58vw",
          width: "74.38%",
          fontFamily,
          color: "var(--foreground)",
          transition: "color 0.3s",
          ...rEduBlock.anim,
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "3.98vw",
            lineHeight: 1.06,
          }}
        >
          National Institute of Technology, Goa
        </p>
        <p
          style={{
            margin: "2.49vw 0 0",
            fontWeight: 700,
            fontSize: "2.99vw",
            lineHeight: 1.01,
          }}
        >
          2023-Present
        </p>
        <p
          style={{
            margin: "2.24vw 0 0",
            fontWeight: 300,
            fontSize: "3.98vw",
            lineHeight: 1.01,
          }}
        >
          B.Tech, Mechanical Engineering
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════
   Home — wires state to both layouts; CSS media queries show one at a time.
   ═════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  function scrollToId(id: string) {
    // Desktop + mobile layouts both carry an anchor with this id, but only
    // the layout visible at the current viewport is rendered. Pick whichever
    // has a non-null offsetParent so we scroll to the element the user sees.
    const candidates = document.querySelectorAll<HTMLElement>(`[id="${id}"]`);
    const el =
      Array.from(candidates).find((n) => n.offsetParent !== null) ??
      candidates[0] ??
      null;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const bg = isDark ? "#131254" : "#ffffff";

  return (
    <main
      style={{
        width: "100%",
        overflowX: "hidden",
        background: bg,
        transition: "background 0.3s",
      }}
    >
      <div className="layout-desktop">
        <DesktopLayout
          isDark={isDark}
          toggle={toggleTheme}
          scrollToId={scrollToId}
          bg={bg}
        />
      </div>
      <div className="layout-mobile">
        <MobileLayout
          isDark={isDark}
          toggle={toggleTheme}
          scrollToId={scrollToId}
        />
      </div>
    </main>
  );
}
