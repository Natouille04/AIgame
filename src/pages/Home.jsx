import { useEffect, useState, useCallback } from "react";
import Loading from "../components/Loading";
import ComputerContainer from "../components/ComputerContainer";

/* ─── CSS global injecté une seule fois ─── */
const GLOBAL_CSS = `
  @keyframes phosphorPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes scanLine {
    from { transform: translateX(-4rem); }
    to   { transform: translateX(20rem); }
  }
  @keyframes crtScan {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes cursorBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes glitchFlash {
    0%   { clip-path: inset(0 0 95% 0); transform: translateX(3px); }
    20%  { clip-path: inset(30% 0 50% 0); transform: translateX(-3px); }
    40%  { clip-path: inset(60% 0 20% 0); transform: translateX(2px); }
    60%  { clip-path: inset(80% 0 5% 0);  transform: translateX(-2px); }
    80%  { clip-path: inset(10% 0 80% 0); transform: translateX(1px); }
    100% { clip-path: inset(0 0 0 0);     transform: translateX(0); }
  }

  /* Hover sur les boutons : 100% CSS, zéro JS */
  .term-btn {
    color: #22c55e;
    background: transparent;
    transition: background 0ms, color 0ms;
    will-change: background, color;
  }
  .term-btn:hover {
    color: #000;
    background: #22c55e;
  }
  .term-btn:active {
    background: #16a34a;
    color: #000;
  }

  /* Glitch CSS pur déclenché via classe */
  .term-btn.glitch::before {
    content: attr(data-text);
    position: absolute;
    left: 0; top: 0;
    color: #0ff;
    clip-path: inset(0 0 0 0);
    animation: glitchFlash 0.15s steps(1) forwards;
    pointer-events: none;
  }
  .term-btn.glitch::after {
    content: attr(data-text);
    position: absolute;
    left: 2px; top: 0;
    color: #ff0044;
    clip-path: inset(0 0 0 0);
    animation: glitchFlash 0.15s steps(1) 0.02s forwards;
    pointer-events: none;
  }
  .term-btn {
    position: relative;
    overflow: visible;
  }

  /* Curseur clignotant CSS pur */
  .term-cursor {
    display: inline-block;
    color: #22c55e;
    animation: cursorBlink 1.06s step-start infinite;
    will-change: opacity;
  }

  /* Scan lines CRT : pseudo-élément CSS, pas de canvas */
  .crt-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
  }
  /* Lignes horizontales */
  .crt-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 2px,
      rgba(0,0,0,0.15) 2px,
      rgba(0,0,0,0.15) 3px
    );
    will-change: transform;
  }
  /* Ligne lumineuse qui descend */
  .crt-overlay::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 60px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(34,197,94,0.05) 50%,
      transparent 100%
    );
    animation: crtScan 6s linear infinite;
    will-change: transform;
  }
  /* Vignette */
  .crt-vignette {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9998;
    background: radial-gradient(
      ellipse at 50% 50%,
      transparent 50%,
      rgba(0,0,0,0.55) 100%
    );
  }
`;

let cssInjected = false;
function injectCSS() {
  if (cssInjected) return;
  cssInjected = true;
  const style = document.createElement("style");
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

/* ─── Hook typing — setState batché, pas de RAF ─── */
function useTyping(text, speed = 40, startDelay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    let i = 0;
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) clearInterval(iv);
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, speed, startDelay]);
  const done = count >= text.length;
  return { displayed: text.slice(0, count), done };
}

/* ─── Ligne de terminal ─── */
function TermLine({ text, speed = 35, delay = 0, showCursor = false }) {
  const { displayed, done } = useTyping(text, speed, delay);
  return (
    <p className="w-full h-8 flex justify-start items-center text-green-500 text-2xl font-mono">
      {displayed}
      {showCursor && <span className="term-cursor">█</span>}
    </p>
  );
}

/* ─── Bouton terminal : glitch via className, hover 100% CSS ─── */
function TermButton({ children, onClick }) {
  const [glitch, setGlitch] = useState(false);

  const handleClick = useCallback(() => {
    setGlitch(true);
    // On retire la classe après l'animation (150ms)
    const t = setTimeout(() => {
      setGlitch(false);
      onClick?.();
    }, 150);
    return () => clearTimeout(t);
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      data-text={typeof children === "string" ? children : undefined}
      className={`term-btn w-full h-8 flex justify-start items-center text-2xl font-mono${glitch ? " glitch" : ""}`}
    >
      {children}
    </button>
  );
}

/* ─── Titre avec glitch aléatoire (timeouts simples) ─── */
function GlitchTitle({ text, delay = 0 }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setGlitch(true);
        setTimeout(() => { setGlitch(false); schedule(); }, 130);
      }, delay + 2500 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span style={{
      display: "inline-block",
      textShadow: glitch
        ? "3px 0 #ff0044, -3px 0 #00ffff, 0 0 8px #22c55e"
        : "0 0 16px rgba(34,197,94,0.45)",
      transform: glitch ? "translateX(3px)" : "none",
      transition: glitch ? "none" : "text-shadow 0.4s",
    }}>
      {text}
    </span>
  );
}

/* ─── Boot séquence ─── */
const BOOT_LINES = [
  "BIOS v2.4.1 — Initializing...",
  "Memory check: 640K OK",
  "Loading Promptly/Executed kernel...",
  "Mounting /dev/game ... [OK]",
  "Starting services... [OK]",
  "> Ready.",
];

function BootLines({ onDone }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= BOOT_LINES.length) { const t = setTimeout(onDone, 250); return () => clearTimeout(t); }
    const t = setTimeout(() => setIdx(i => i + 1), idx === 0 ? 150 : 380 + Math.random() * 180);
    return () => clearTimeout(t);
  }, [idx, onDone]);
  return (
    <div className="flex flex-col">
      {BOOT_LINES.slice(0, idx).map((l, i) => (
        <p key={i} className="text-green-500 text-sm font-mono opacity-80 leading-6">{l}</p>
      ))}
    </div>
  );
}

/* ─── Composant principal ─── */
export default function Home() {
  const [pageState, setPageState] = useState(0);
  const [computerState, setComputerState] = useState("base");
  const [loading, setLoading] = useState(true);
  const [titleVisible, setTitleVisible] = useState(true);
  const [showBoot, setShowBoot] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => { injectCSS(); }, []);

  const goToPC = useCallback(() => {
    setTitleVisible(false);
    setTimeout(() => { setPageState(1); setShowBoot(true); setTitleVisible(true); }, 400);
  }, []);

  const goToTitle = useCallback(() => {
    setTitleVisible(false);
    setTimeout(() => {
      setPageState(0);
      setComputerState("base");
      setBootDone(false);
      setShowBoot(false);
      setTitleVisible(true);
    }, 400);
  }, []);

  const switchState = useCallback((s) => setComputerState(s), []);
  const handleBootDone = useCallback(() => setBootDone(true), []);

  useEffect(() => {
    const handleAction = () => { if (pageState !== 0) return; goToPC(); };
    window.addEventListener("keydown", handleAction);
    window.addEventListener("mousedown", handleAction);
    return () => {
      window.removeEventListener("keydown", handleAction);
      window.removeEventListener("mousedown", handleAction);
    };
  }, [pageState, goToPC]);

  useEffect(() => {
    const onLoad = () => setLoading(false);
    if (document.readyState === "complete") onLoad();
    else { window.addEventListener("load", onLoad); return () => window.removeEventListener("load", onLoad); }
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-screen p-5 flex flex-col items-center justify-center background-pattern bg-gray-900 text-white overflow-hidden relative">
      {/* CRT overlay 100% CSS — zéro JS, zéro canvas */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {/* Fondu uniquement titre ↔ PC */}
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{ opacity: titleVisible ? 1 : 0, transition: "opacity 400ms ease" }}
      >
        {/* ── ÉCRAN TITRE ── */}
        {pageState === 0 && (
          <>
            {/* Lueur phosphore */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.05) 0%, transparent 65%)",
              animation: "phosphorPulse 4s ease-in-out infinite",
            }} />

            <div className="w-70 flex flex-col select-none" style={{ animation: "floatUp 6s ease-in-out infinite" }}>
              <p className="text-5xl font-bold CascadiaCode self-start">
                <GlitchTitle text="Promptly" delay={0} />
              </p>
              <p className="text-5xl font-bold CascadiaCode self-end">
                <GlitchTitle text="Executed" delay={800} />
              </p>
            </div>

            {/* Ligne décorative */}
            <div className="w-64 h-px my-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500 opacity-30" />
              <div className="absolute top-0 h-full w-16 bg-green-400"
                style={{ boxShadow: "0 0 8px #22c55e", animation: "scanLine 2.5s linear infinite" }} />
            </div>

            <p className="text-xl font-bold select-none tracking-[0.25em] text-green-400"
              style={{ animation: "blink 1.1s step-start infinite", textShadow: "0 0 10px rgba(34,197,94,0.6)" }}>
              PRESS ANY BUTTON
            </p>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-widest opacity-50 font-mono">
              Copyright Nouille and Mania © {new Date().getFullYear()}
            </p>
          </>
        )}

        {/* ── ÉCRAN PC ── */}
        {pageState === 1 && (
          <ComputerContainer>
            {showBoot && !bootDone ? (
              <BootLines onDone={handleBootDone} />
            ) : (
              <>
                {computerState === "base" && (
                  <div>
                    <TermLine text="C:\> show menu" speed={30} />
                    <p className="h-4" />
                    <TermLine text="Select an option below :" speed={25} />
                    <p className="h-2" />
                    <TermButton onClick={() => switchState("play")}>⠀&gt; PLAY</TermButton>
                    <TermButton onClick={() => switchState("settings")}>⠀&gt; SETTINGS</TermButton>
                    <TermButton onClick={goToTitle}>⠀&gt; BACK</TermButton>
                  </div>
                )}

                {computerState === "play" && (
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <TermLine text="C:\> run lobby" speed={30} />
                      <p className="h-4" />
                      <TermLine text="Connecting to server..." speed={40} delay={200} showCursor />
                    </div>
                    <div />
                    <TermButton onClick={() => switchState("base")}>&gt; BACK</TermButton>
                  </div>
                )}

                {computerState === "settings" && (
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <TermLine text="C:\> edit Setting.cfg" speed={30} />
                      <p className="h-4" />
                      <p className="w-full h-8 flex justify-start items-center text-black bg-green-500 text-2xl px-1 font-mono">
                        Editing "Setting.cfg" :
                      </p>
                    </div>
                    <div className="h-full overflow-auto scrollbar-none flex flex-col justify-start" />
                    <div className="flex flex-col">
                      <TermButton>&gt; SAVE</TermButton>
                      <TermButton onClick={() => switchState("base")}>&gt; BACK</TermButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </ComputerContainer>
        )}
      </div>
    </div>
  );
}