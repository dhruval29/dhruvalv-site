"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";

/**
 * Personal portfolio page — Figma node 42-349 (Wireframe-12)
 *
 * Reference canvas: 1536 px wide × ~1560 px tall.
 * Responsive conversion rules applied throughout:
 *   x positions  → px / 1536 × 100  → %
 *   y positions  → px / 1536 × 100  → vw
 *   font sizes   → px / 1536 × 100  → vw
 */

const NAV_LINKS = ["ABOUT", "PROJECTS", "SKILLS", "CONTACT"] as const;

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
        {/* left arrowhead */}
        <div style={{ width: 0, height: 0, borderTop: `${arrowSize} solid transparent`, borderBottom: `${arrowSize} solid transparent`, borderRight: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
        <div style={{ flex: 1, height: lineThick, background: color }} />
        <span style={font}>{value}px</span>
        <div style={{ flex: 1, height: lineThick, background: color }} />
        {/* right arrowhead */}
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
      {/* top arrowhead */}
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
      {/* bottom arrowhead */}
      <div style={{ width: 0, height: 0, borderLeft: `${arrowSize} solid transparent`, borderRight: `${arrowSize} solid transparent`, borderTop: `calc(${arrowSize} * 1.8) solid ${color}`, flexShrink: 0 }} />
    </div>
  );
}

/** Profile photo with live dimension annotations (Figma-style) */
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
      {/* Photo */}
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

      {/* Width annotation (below photo) */}
      {dims.w > 0 && <DimLine type="horizontal" value={dims.w} bg={bg} isDark={isDark} />}

      {/* Height annotation (right of photo) */}
      {dims.h > 0 && <DimLine type="vertical" value={dims.h} bg={bg} isDark={isDark} />}
    </div>
  );
}

/** Mobile profile photo with the same live dimension annotations */
function MobilePhotoWithDimensions({ bg, isDark }: { bg: string; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
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
      style={{
        position: "absolute",
        left: "9.07%",
        top: "42.33vw",
        width: "45.99%",
        height: "53.56vw",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "1.23%",
          overflow: "hidden",
        }}
      >
        <Image
          src="/profile.jpg"
          alt="Dhruval J. Vashi"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "42% top" }}
        />
      </div>

      {dims.w > 0 && <DimLine type="horizontal" value={dims.w} bg={bg} isDark={isDark} />}
      {dims.h > 0 && <DimLine type="vertical" value={dims.h} bg={bg} isDark={isDark} />}
    </div>
  );
}

/** Corner-dot accent squares used inside each nav button */
function CornerDots() {
  const shared: React.CSSProperties = {
    position: "absolute",
    width: "0.20vw",
    height: "0.20vw",
    background: "#514532",
  };
  return (
    <>
      <span style={{ ...shared, top: "0.20vw", left: "0.20vw" }} />
      <span style={{ ...shared, bottom: "0.24vw", left: "0.20vw" }} />
      <span style={{ ...shared, bottom: "0.24vw", right: "0.15vw" }} />
      <span style={{ ...shared, top: "0.20vw", right: "0.15vw" }} />
    </>
  );
}

/** India flag accent added beside the name, matching updated Figma */
function NameFlag({ isDark }: { isDark: boolean }) {
  const poleReveal = useReveal<HTMLDivElement>(0.18, "up");
  const flagReveal = useReveal<HTMLDivElement>(0.26, "up");

  return (
    <>
      {/* Pole */}
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

      {/* Flag */}
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

/**
 * "Toggle System Illumination" lever — ported from the Stitch design.
 * Receives isDark + toggle from the parent so the whole page can react.
 */
function ThemeLever({
  isDark,
  toggle,
  left = "92.20%",
  top = "2.01vw",
  width = "3.80%",
}: {
  isDark: boolean;
  toggle: () => void;
  left?: string;
  top?: string;
  width?: string;
}) {
  const reveal = useReveal<HTMLDivElement>(0.08, "up");

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
        cursor: "pointer",
        userSelect: "none",
        ...reveal.anim,
      }}
    >
      {/* ── Lever body ─────────────────────────────────────────── */}
      {/* Dark mode: #1a1a1a body / #353535 border                          */}
      {/* Light mode: #e5e2e1 body / #d5c4ab border  (mechanical-btn style) */}
      <div
        style={{
          position: "relative",
          border: `0.17vw solid ${isDark ? "#353535" : "#d5c4ab"}`,
          background: isDark ? "#1a1a1a" : "#e5e2e1",
          width: "100%",
          paddingTop: "145%",
          boxShadow: isDark
            ? "inset 0 0.26vw 0.52vw rgba(0,0,0,0.8), 0 0.07vw 0.07vw rgba(255,255,255,0.05)"
            : "inset 0 0.13vw 0.26vw rgba(0,0,0,0.15), 0 0.07vw 0.07vw rgba(255,255,255,0.8)",
          transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* ── Slot (vertical track) ──────────────────────────── */}
        {/* Dark: #0a0a0a slot / Light: #b8b2a8 slot              */}
        <div
          style={{
            position: "absolute",
            top: "0.66vw",
            bottom: "0.66vw",
            left: "50%",
            transform: "translateX(-50%)",
            width: "27%",
            borderRadius: "0.50vw",
            background: isDark ? "#0a0a0a" : "#b8b2a8",
            boxShadow: isDark
              ? "inset 0 0.13vw 0.26vw rgba(0,0,0,1)"
              : "inset 0 0.13vw 0.26vw rgba(0,0,0,0.25)",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            transition: "background 0.3s",
          }}
        >
          {/* gradient rod — lighter in light mode */}
          <div
            style={{
              width: "0.26vw",
              height: "100%",
              background: isDark
                ? "linear-gradient(90deg, #444 0%, #888 50%, #444 100%)"
                : "linear-gradient(90deg, #888 0%, #514532 50%, #888 100%)",
              boxShadow: "0 0 0.17vw rgba(0,0,0,0.5)",
              transition: "background 0.3s",
            }}
          />
        </div>

        {/* ── Handle (red pill that slides up/down) ─────────── */}
        {/* light → translateY(0.26vw)  /  dark → translateY(2.34vw)         */}
        {/* 4px/44px × 2.86vw ≈ 0.26vw ;  36px/44px × 2.86vw ≈ 2.34vw      */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: `translateX(-50%) translateY(${isDark ? "0.34vw" : "3.10vw"})`,
            transition: "transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            width: "55%",
            height: "1.38vw",
            background: "linear-gradient(180deg, #8b0000 0%, #600000 100%)",
            border: "0.09vw solid #412d00",
            borderRadius: "0.17vw",
            boxShadow: "0 0.34vw 0.68vw rgba(0,0,0,0.6)",
            zIndex: 10,
          }}
        >
          {/* grip texture stripes */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
            }}
          />
        </div>

        {/* ── Inner shadow overlay ───────────────────────────── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0.26vw 0.52vw rgba(0,0,0,0.8)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}

function NameFlagMobile({ isDark }: { isDark: boolean }) {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "37.91%",
          top: "117.67vw",
          width: "0.12vw",
          height: "8.37vw",
          background: isDark ? "#ffffff" : "#000000",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "41.63%",
          top: "117.67vw",
          width: "11.52%",
          height: "7.64vw",
          overflow: "hidden",
        }}
      >
        <Image src="/Flag_of_India.svg.png" alt="" fill style={{ objectFit: "cover" }} />
      </div>
    </>
  );
}

function MobileNavButton({
  label,
  href,
  onClick,
  width,
}: {
  label: string;
  href: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  width: string;
}) {
  return (
    <a
      className="nav-btn"
      href={href}
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width,
        height: "8.84vw",
        background: "#ffb800",
        border: "0.43vw solid #353535",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 700,
        fontSize: "2.38vw",
        letterSpacing: "0.24vw",
        textTransform: "uppercase",
        color: "#000",
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <CornerDots />
    </a>
  );
}

/**
 * Scroll-reveal hook — observes an element and returns animated style once it
 * enters the viewport. Fires immediately for above-the-fold elements so hero
 * text still animates on page load.
 */
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

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
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

  // ── Scroll reveal hooks (one per animated text block) ──────────────────
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

  if (isMobile) {
    return (
      <main style={{ width: "100%", overflowX: "hidden", background: isDark ? "#131254" : "#ffffff", transition: "background 0.3s" }}>
        <div style={{ position: "relative", width: "100%", height: "402vw" }}>
          <div id="skills" aria-hidden="true" style={{ position: "absolute", left: 0, top: "160vw", width: 1, height: 1 }} />
          <div id="about" aria-hidden="true" style={{ position: "absolute", left: 0, top: "214vw", width: 1, height: 1 }} />
          <div id="contact" aria-hidden="true" style={{ position: "absolute", left: 0, top: "331vw", width: 1, height: 1 }} />
          <div id="projects" aria-hidden="true" style={{ position: "absolute", left: 0, top: "186vw", width: 1, height: 1 }} />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), " +
                "linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
              backgroundSize: "5.58vw 5.58vw",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-52.09%",
              top: "-78.37vw",
              width: "130.42%",
              height: "128.74vw",
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <div style={{ position: "absolute", inset: "31.94% 33.83% 15.38% 12.70%" }}>
              <Image src="/6326.svg" alt="" fill style={{ objectFit: "contain" }} />
            </div>
          </div>

          <ThemeLever
            isDark={isDark}
            toggle={toggleTheme}
            left="73.26%"
            top="8.84vw"
            width="10.23%"
          />

          <MobilePhotoWithDimensions bg={isDark ? "#131254" : "#ffffff"} isDark={isDark} />

          <div
            style={{
              position: "absolute",
              left: "8.37%",
              top: "108.37vw",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 900,
              fontSize: "9.30vw",
              lineHeight: 1,
              color: "var(--foreground)",
              transition: "color 0.3s",
              whiteSpace: "nowrap",
            }}
          >
            <p style={{ margin: 0 }}>Dhruval J.</p>
            <p style={{ margin: 0 }}>Vashi</p>
          </div>
          <NameFlagMobile isDark={isDark} />

          <div
            style={{
              position: "absolute",
              left: "9.07%",
              top: "133.26vw",
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 300,
              fontSize: "5.58vw",
              lineHeight: 1.01,
              color: "var(--foreground)",
              transition: "color 0.3s",
              whiteSpace: "nowrap",
            }}
          >
            <p style={{ margin: 0 }}>{"Engineer, Av-Geek & "}</p>
            <p style={{ margin: 0 }}>Photographer</p>
          </div>

          <div style={{ position: "absolute", left: "9.07%", top: "160vw", display: "flex", gap: "8.37vw" }}>
            <MobileNavButton label="SKILLS" href="#skills" width="18.14%" onClick={(e) => { e.preventDefault(); scrollToId("skills"); }} />
            <MobileNavButton label="ABOUT" href="#about" width="18.84%" onClick={(e) => { e.preventDefault(); scrollToId("about"); }} />
            <MobileNavButton label="CONTACT" href="#contact" width="21.86%" onClick={(e) => { e.preventDefault(); scrollToId("contact"); }} />
          </div>
          <div style={{ position: "absolute", left: "33.72%", top: "177.67vw" }}>
            <MobileNavButton label="PROJECTS" href="#projects" width="23.49%" onClick={(e) => { e.preventDefault(); scrollToId("projects"); }} />
          </div>

          <p
            style={{
              position: "absolute",
              left: "9.07%",
              top: "214vw",
              margin: 0,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 700,
              fontSize: "7.44vw",
              lineHeight: 1.01,
              color: "var(--foreground)",
              transition: "color 0.3s",
            }}
          >
            ABOUT
          </p>
          <p
            style={{
              position: "absolute",
              left: "9.07%",
              top: "235.12vw",
              width: "76.74%",
              margin: 0,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 300,
              fontSize: "5.58vw",
              lineHeight: 1.12,
              color: "var(--foreground)",
              transition: "color 0.3s",
            }}
          >
            When I was younger , always loved to tinker with things that move, my dad got me a MECHANIX set &amp; I used to spend hours working on that.
          </p>
          <p
            style={{
              position: "absolute",
              left: "9.07%",
              top: "279.53vw",
              width: "84.65%",
              margin: 0,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 300,
              fontSize: "5.58vw",
              lineHeight: 1.12,
              color: "var(--foreground)",
              transition: "color 0.3s",
            }}
          >
            Living next to an Airport, made me fascinated about planes, that such a humongous thing can fly.
          </p>

          <p
            style={{
              position: "absolute",
              left: "8.37%",
              top: "331.16vw",
              margin: 0,
              fontFamily: "var(--font-montserrat), sans-serif",
              fontWeight: 700,
              fontSize: "7.44vw",
              lineHeight: 1.01,
              color: "var(--foreground)",
              transition: "color 0.3s",
            }}
          >
            EDUCATION
          </p>
          <div style={{ position: "absolute", left: "9.07%", top: "344.19vw", width: "11.16%", height: "11.16vw" }}>
            <Image src="/nitg-logo.png" alt="NIT Goa logo" fill style={{ objectFit: "contain" }} />
          </div>
          <div
            style={{
              position: "absolute",
              left: "9.07%",
              top: "358.60vw",
              width: "69.53%",
              color: "var(--foreground)",
              transition: "color 0.3s",
            }}
          >
            <p style={{ margin: 0, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: "3.72vw", lineHeight: 1.06 }}>
              National Institute of Technology, Goa
            </p>
            <p style={{ margin: "1.40vw 0 0", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: "2.79vw", lineHeight: 1.01 }}>
              2023-Present
            </p>
            <p style={{ margin: "1.63vw 0 0", fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 300, fontSize: "3.72vw", lineHeight: 1.01 }}>
              B.Tech, Mechanical Engineering
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ width: "100%", overflowX: "hidden", background: isDark ? "#131254" : "#ffffff", transition: "background 0.3s" }}>
      {/*
        ─────────────────────────────────────────────────────────────────────
        Full-page canvas
        Total content height ≈ 1560 px @ 1536 px wide → 101.56 vw.
        We use 106 vw to add comfortable bottom breathing room.
        ─────────────────────────────────────────────────────────────────────
      */}
      <div style={{ position: "relative", width: "100%", height: "106vw" }}>
        {/* Invisible anchors so nav links always work */}
        <div id="projects" aria-hidden="true" style={{ position: "absolute", left: 0, top: "78vw", width: 1, height: 1 }} />
        <div id="skills" aria-hidden="true" style={{ position: "absolute", left: 0, top: "92vw", width: 1, height: 1 }} />
        <div id="contact" aria-hidden="true" style={{ position: "absolute", left: 0, top: "104vw", width: 1, height: 1 }} />

        {/* ── Grid background ────────────────────────────────────────────── */}
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

        {/* ── Navigation bar ─────────────────────────────────────────────── */}
        {/*   Container: left 432/1536=28.13%, top 44.54/1536=2.90vw,        */}
        {/*   width 591.415/1536=38.51%, height 57.072/1536=3.72vw            */}
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
              <CornerDots />
            </a>
          ))}
        </nav>

        {/* ── Theme lever — "Toggle System Illumination" ─────────────────── */}
        <ThemeLever isDark={isDark} toggle={toggleTheme} />

        {/* ── Name "Dhruval J. / Vashi" ──────────────────────────────────── */}
        {/*   left 113/1536=7.36%,  top 248/1536=16.15vw,  font 72/1536=4.69vw */}
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

        {/* ── Subtitle ───────────────────────────────────────────────────── */}
        {/*   left 113/1536=7.36%,  top 418/1536=27.21vw,  font 50/1536=3.26vw */}
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

        {/* ── Profile photo + live dimension annotations ─────────────────── */}
        <PhotoWithDimensions bg={isDark ? "#131254" : "#ffffff"} isDark={isDark} />

        {/* ── Gear / cog (partially clipped, slowly rotating) ────────────── */}
        {/*   Container: left -269/1536=-17.51%,  top -367/1536=-23.89vw     */}
        {/*   width 701/1536=45.64%,  height 692/1536=45.05vw                */}
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

        {/* ── Camera decoration (bottom-left, flipped & rotated) ─────────── */}
        {/*   Outer: left -69/1536=-4.49%,  top 492/1536=32.03vw             */}
        {/*   Outer size: 387.205/1536=25.21% wide, aspect-ratio 1:1          */}
        {/*   Inner (319.419/387.205=81.07%): scaleY(-1) rotate(164.27deg)   */}
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
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ABOUT SECTION
            top 874/1536 = 56.90 vw
        ═══════════════════════════════════════════════════════════════════ */}

        {/* ── "ABOUT" heading ────────────────────────────────────────────── */}
        {/*   left 118/1536=7.68%,  top 874/1536=56.90vw,  font 48/1536=3.13vw */}
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

        {/* ── About paragraph 1 ──────────────────────────────────────────── */}
        {/*   top 965/1536=62.82vw,  width 1147/1536=74.67%,  font 32/1536=2.08vw */}
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

        {/* ── About paragraphs 2 & 3 ─────────────────────────────────────── */}
        {/*   top 1080/1536=70.31vw */}
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

        {/* ═══════════════════════════════════════════════════════════════════
            EDUCATION SECTION
            top 1369/1536 = 89.13 vw
        ═══════════════════════════════════════════════════════════════════ */}

        {/* ── "EDUCATION" heading ────────────────────────────────────────── */}
        {/*   left 118/1536=7.68%,  top 1369/1536=89.13vw,  font 48/1536=3.13vw */}
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

        {/* ── NIT Goa logo ───────────────────────────────────────────────── */}
        {/*   left 106/1536=6.90%,  top 1455/1536=94.73vw                    */}
        {/*   width 75.816/1536=4.94%,  height 76.464/1536=4.98vw            */}
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

        {/* ── Institution name ───────────────────────────────────────────── */}
        {/*   left 209/1536=13.61%,  top 1459/1536=94.99vw,  font 34/1536=2.21vw */}
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

        {/* ── Degree ─────────────────────────────────────────────────────── */}
        {/*   left 207/1536=13.48%,  top 1500/1536=97.66vw,  font 32/1536=2.08vw */}
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

        {/* ── Year ───────────────────────────────────────────────────────── */}
        {/*   left 1183/1536=77.02%,  top 1463/1536=95.25vw,  font 32/1536=2.08vw */}
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
    </main>
  );
}
