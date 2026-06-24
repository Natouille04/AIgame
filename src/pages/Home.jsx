import { useEffect, useState, useRef, useCallback } from "react";
import Loading from "../components/Loading";
import ComputerContainer from "../components/ComputerContainer";

/* ─── Petit hook : effet "typing" d'une ligne de texte ─── */
function useTyping(text, speed = 40, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const t0 = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t0);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

/* ─── Curseur clignotant ─── */
function Cursor({ visible = true }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => setOn(p => !p), 530);
    return () => clearInterval(iv);
  }, []);
  if (!visible) return null;
  return <span style={{ opacity: on ? 1 : 0, color: "#22c55e" }}>█</span>;
}

/* ─── Flash glitch au clic ─── */
function useGlitch() {
  const [glitching, setGlitching] = useState(false);
  const trigger = useCallback(() => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 180);
  }, []);
  return { glitching, trigger };
}

/* ─── Overlay CRT (scan-lines + vignette + static noise) ─── */
function CRTOverlay() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let frame = 0;
    function draw() {
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Static noise (subtle)
      const imageData = ctx.createImageData(W, H);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() > 0.97 ? Math.floor(Math.random() * 80) : 0;
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = v ? 60 : 0;
      }
      ctx.putImageData(imageData, 0, 0);

      // Scan lines
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, y, W, 1);
      }

      // Moving bright scan line
      const scanY = ((frame * 1.5) % (H + 40)) - 20;
      const grad = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
      grad.addColorStop(0, "rgba(34,197,94,0)");
      grad.addColorStop(0.5, "rgba(34,197,94,0.07)");
      grad.addColorStop(1, "rgba(34,197,94,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 10, W, 20);

      // Vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      frame++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 9999,
      }}
    />
  );
}

/* ─── Ligne de terminal avec typing ─── */
function TermLine({ text, speed = 35, delay = 0, showCursor = false }) {
  const { displayed, done } = useTyping(text, speed, delay);
  return (
    <p className="w-full h-8 flex justify-start items-center text-green-500 text-2xl">
      {displayed}<Cursor visible={showCursor && !done} />
      {done && showCursor && <Cursor visible />}
    </p>
  );
}

/* ─── Bouton terminal avec effet glitch ─── */
function TermButton({ children, onClick, className = "" }) {
  const { glitching, trigger } = useGlitch();
  const [pressed, setPressed] = useState(false);

  const handleClick = (e) => {
    trigger();
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onClick && onClick(e);
    }, 160);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full h-8 flex justify-start items-center text-green-500 text-2xl
        hover:text-black hover:bg-green-500 transition-colors duration-75
        ${pressed ? "bg-green-400 text-black scale-[0.99]" : ""}
        ${glitching ? "translate-x-[2px] opacity-80" : ""}
        ${className}`}
      style={{
        textShadow: glitching ? "2px 0 #ff0, -2px 0 #0ff" : "none",
        transition: glitching ? "none" : undefined,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Titre animé avec glitch en boucle ─── */
function GlitchTitle({ text }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const schedule = () => {
      const delay = 2500 + Math.random() * 3000;
      return setTimeout(() => {
        setGlitch(true);
        setTimeout(() => { setGlitch(false); schedule(); }, 150);
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return (
    <span
      style={{
        display: "inline-block",
        textShadow: glitch
          ? "3px 0 #ff0044, -3px 0 #00ffff, 0 0 8px #22c55e"
          : "0 0 12px rgba(34,197,94,0.4)",
        transform: glitch ? `translateX(${Math.random() > 0.5 ? 3 : -3}px)` : "none",
        transition: glitch ? "none" : "text-shadow 0.3s",
        letterSpacing: glitch ? "0.05em" : "normal",
      }}
    >
      {text}
    </span>
  );
}

/* ─── Boot sequence ─── */
function BootLines({ onDone }) {
  const lines = [
    "BIOS v2.4.1 — Initializing...",
    "Memory check: 640K OK",
    "Loading Promptly/Executed kernel...",
    "Mounting /dev/game ... [OK]",
    "Starting services... [OK]",
    "> Ready.",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx >= lines.length) { setTimeout(onDone, 300); return; }
    const t = setTimeout(() => setIdx(i => i + 1), idx === 0 ? 200 : 450 + Math.random() * 200);
    return () => clearTimeout(t);
  }, [idx]);
  return (
    <div className="flex flex-col gap-0">
      {lines.slice(0, idx).map((l, i) => (
        <p key={i} className="text-green-500 text-sm font-mono opacity-80">{l}</p>
      ))}
    </div>
  );
}

export default function Home() {
  const [pageState, setPageState] = useState(0);
  const [computerState, setComputerState] = useState("base");
  const [loading, setLoading] = useState(true);
  // fade uniquement pour titre → PC
  const [titleVisible, setTitleVisible] = useState(true);
  const [showBoot, setShowBoot] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  /* Transition TITRE → PC avec boot séquence */
  const goToPC = useCallback(() => {
    setTitleVisible(false);
    setTimeout(() => {
      setPageState(1);
      setShowBoot(true);
      setTitleVisible(true);
    }, 400);
  }, []);

  /* Transitions INTERNES au terminal : instantané (pas de fondu) */
  const switchState = useCallback((newComputerState) => {
    setComputerState(newComputerState);
  }, []);

  /* BACK vers titre */
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

  useEffect(() => {
    const handleAction = (e) => {
      if (pageState !== 0) return;
      goToPC();
    };
    window.addEventListener("keydown", handleAction);
    window.addEventListener("mousedown", handleAction);
    return () => {
      window.removeEventListener("keydown", handleAction);
      window.removeEventListener("mousedown", handleAction);
    };
  }, [pageState, goToPC]);

  useEffect(() => {
    const onPageLoad = () => setLoading(false);
    if (document.readyState === "complete") onPageLoad();
    else {
      window.addEventListener("load", onPageLoad, false);
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="w-full h-screen p-5 flex flex-col items-center gap-y-15 justify-center background-pattern bg-gray-900 text-white overflow-hidden relative">
      <CRTOverlay />

      {/* Fondu uniquement sur la transition titre ↔ PC */}
      <div
        className="w-full h-full flex flex-col items-center justify-center"
        style={{
          opacity: titleVisible ? 1 : 0,
          transition: "opacity 400ms ease",
        }}
      >
        {/* ── ÉCRAN TITRE ── */}
        {pageState === 0 && (
          <>
            {/* Phosphore ambiant animé */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)",
                animation: "phosphorPulse 4s ease-in-out infinite",
              }}
            />
            <style>{`
              @keyframes phosphorPulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50%       { opacity: 1;   transform: scale(1.04); }
              }
              @keyframes floatUp {
                0%, 100% { transform: translateY(0px); }
                50%       { transform: translateY(-6px); }
              }
              @keyframes blink {
                0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; }
              }
              @keyframes scanIn {
                from { clip-path: inset(0 0 100% 0); opacity: 0; }
                to   { clip-path: inset(0 0 0% 0);   opacity: 1; }
              }
            `}</style>

            <div
              className="w-70 flex flex-col select-none"
              style={{ animation: "floatUp 6s ease-in-out infinite" }}
            >
              <p className="text-5xl font-bold CascadiaCode self-start"
                style={{ textShadow: "0 0 20px rgba(34,197,94,0.5)" }}>
                <GlitchTitle text="Promptly" />
              </p>
              <p className="text-5xl font-bold CascadiaCode self-end"
                style={{ textShadow: "0 0 20px rgba(34,197,94,0.5)" }}>
                <GlitchTitle text="Executed" />
              </p>
            </div>

            {/* Ligne décorative animée */}
            <div className="w-64 h-px my-6 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-green-500"
                style={{ opacity: 0.3 }}
              />
              <div
                className="absolute top-0 h-full w-16 bg-green-400"
                style={{
                  animation: "scanLine 2.5s linear infinite",
                  boxShadow: "0 0 8px #22c55e",
                }}
              />
            </div>
            <style>{`
              @keyframes scanLine {
                from { left: -4rem; }
                to   { left: 100%; }
              }
            `}</style>

            <div className="flex flex-col items-center h-12 justify-center">
              <p
                className="text-xl font-bold select-none tracking-[0.25em] text-green-400"
                style={{
                  animation: "blink 1.1s step-start infinite",
                  textShadow: "0 0 10px rgba(34,197,94,0.6)",
                }}
              >
                PRESS ANY BUTTON
              </p>
            </div>

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs tracking-widest opacity-50 font-mono">
              Copyright Nouille and Mania © {new Date().getFullYear()}
            </p>
          </>
        )}

        {/* ── ÉCRAN PC ── */}
        {pageState === 1 && (
          <ComputerContainer>
            {/* Boot séquence → puis menu */}
            {showBoot && !bootDone ? (
              <BootLines onDone={() => setBootDone(true)} />
            ) : (
              <>
                {computerState === "base" && (
                  <div>
                    <TermLine text="C:\> show menu" speed={30} showCursor={false} />
                    <p className="w-full h-4" />
                    <TermLine text="Select an option below :" speed={25} delay={0} showCursor={false} />
                    <p className="w-full h-2" />
                    <TermButton onClick={() => switchState("play")}>⠀&gt; PLAY</TermButton>
                    <TermButton onClick={() => switchState("settings")}>⠀&gt; SETTINGS</TermButton>
                    <TermButton onClick={goToTitle}>⠀&gt; BACK</TermButton>
                  </div>
                )}

                {computerState === "play" && (
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <TermLine text="C:\> run lobby" speed={30} showCursor={false} />
                      <p className="w-full h-4" />
                      <TermLine text="Connecting to server..." speed={40} delay={200} showCursor />
                    </div>
                    <div />
                    <TermButton onClick={() => switchState("base")}>&gt; BACK</TermButton>
                  </div>
                )}

                {computerState === "settings" && (
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <TermLine text='C:\> edit Setting.cfg' speed={30} showCursor={false} />
                      <p className="w-full h-4" />
                      <p className="w-full h-8 flex justify-start items-center text-black bg-green-500 text-2xl px-1 font-mono">
                        Editing "Setting.cfg" :
                      </p>
                    </div>
                    <div className="h-full overflow-auto scrollbar-none flex flex-col justify-start">
                      {/* Options à placer ici plus tard */}
                    </div>
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