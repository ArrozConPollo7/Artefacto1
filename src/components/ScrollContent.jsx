import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

// ─── Glitch Text Reusable Component ───────────────────────────────────────────
function GlitchText({ text, interval = 3800 }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}[]|";
    let intervalId;
    let timeoutId;

    const runGlitch = () => {
      let i = 0;
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        setDisplay(
          text
            .split("")
            .map((ch, idx) => {
              if (ch === " " || ch === "\n" || ch === "/") return ch;
              return idx < i ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );
        i++;
        if (i > text.length) {
          clearInterval(intervalId);
          setDisplay(text);
        }
      }, 25);
    };

    runGlitch();
    const loopId = setInterval(runGlitch, interval);

    return () => {
      clearInterval(intervalId);
      clearInterval(loopId);
    };
  }, [text, interval]);

  return <span>{display}</span>;
}

// ─── Telemetric Log Streamer Component ───────────────────────────────────────
function TelemetryLog({ scrollProgress }) {
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const LOG_TEMPLATES = [
      "ISOLATION VECTOR ARMED // SECURE",
      "CRYOGENIC TEMPERATURE: -273.15°C",
      "SILICON LAYER COHESION: 99.88%",
      "CRIMSON LASER MATRIX DENSITY: 1420/mm³",
      "STANDBY COUPLING DETECTED",
      "SYS // SCANNING FOR VULNERABILITIES...",
      "FEDERAL SIGNATURE KEY: VERIFIED",
      "QUANTUM TELEMETRY BUFFER FLUSHED",
      "ANALOG CONNECTION STRIP STATUS: NOMINAL",
      "STASIS FIELD ENVELOPE: ACTIVE",
      "INMUTE BLOCK 0x98FF: INTEGRITY GOOD",
      "BIO-KEY INTERFACE POLLING...",
      "PRESERVATION BLOCKING LOAD: OK",
    ];

    const interval = setInterval(() => {
      const randomLog = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
      setLogs((prev) => {
        const next = [...prev, `[${timestamp}] ${randomLog}`];
        if (next.length > 8) next.shift();
        return next;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="telemetry-log"
      style={{
        position: 'fixed',
        bottom: '3.5rem',
        right: '2rem',
        zIndex: 40,
        width: '320px',
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.65)',
        border: '1px solid rgba(255, 0, 51, 0.12)',
        backdropFilter: 'blur(8px)',
        borderRadius: '2px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        color: '#ff0033aa',
        textAlign: 'left',
        pointerEvents: 'none',
      }}
    >
      <div style={{ borderBottom: '1px solid rgba(255, 0, 51, 0.2)', paddingBottom: '4px', marginBottom: '6px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
        <span>SYS TELEMETRY // REAL-TIME STREAM</span>
        <span>PRG: {Math.round(scrollProgress * 100)}%</span>
      </div>
      <div style={{ height: '90px', overflow: 'hidden' }}>
        {logs.map((log, idx) => (
          <div key={idx} style={{ opacity: 0.35 + (idx / logs.length) * 0.65, whiteSpace: 'nowrap' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
export default function ScrollContent({ scrollProgress, setEmissionIntensity }) {
  const containerRef = useRef(null)
  const progressBarRef = useRef(null)
  const section1Ref = useRef(null)
  const section2Ref = useRef(null)
  const section3Ref = useRef(null)
  const section4Ref = useRef(null)
  const section5Ref = useRef(null)

  const [activeSection, setActiveSection] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);

  // ─── INIT SMOOTH SCROLL (LENIS) ───
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

      // ─── 0. GLOBAL SCROLL PROGRESS TRACKER ───
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
          setCurrentProgress(self.progress)
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { scaleX: self.progress })
          }

          // Dynamically compute active section based on progress
          if (self.progress < 0.22) {
            setActiveSection(0);
          } else if (self.progress < 0.45) {
            setActiveSection(1);
          } else if (self.progress < 0.72) {
            setActiveSection(2);
          } else if (self.progress < 0.88) {
            setActiveSection(3);
          } else {
            setActiveSection(4);
          }
        },
      })

      // ─── SECTION 1: HERO INTRO (0 - 25%) ───
      const panel1 = section1Ref.current?.querySelector('.text-panel')
      if (panel1) {
        gsap.fromTo(
          panel1,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section1Ref.current,
              start: 'top 80%',
              end: 'top 20%',
              scrub: 0.5,
            },
          }
        )
      }

      // ─── SECTION 2: CONTEXTO HISTÓRICO (25 - 50%) ───
      const panel2 = section2Ref.current?.querySelector('.text-panel')
      if (panel2) {
        gsap.timeline({
          scrollTrigger: {
            trigger: section2Ref.current,
            start: 'top 75%',
            end: 'bottom 20%',
            scrub: 0.5,
          },
        })
        .fromTo(panel2, { opacity: 0, x: 50 }, { opacity: 1, x: 0, duration: 0.4 })
        .to(panel2, { opacity: 0, x: -50, duration: 0.4 }, "+=0.25")
      }

      // ─── SECTION 3: ANATOMÍA FORENSE (50 - 75%) ───
      const panel3 = section3Ref.current?.querySelector('.text-panel')
      if (panel3) {
        ScrollTrigger.create({
          trigger: section3Ref.current,
          start: 'top top',
          end: '+=200%',
          pin: true,
          pinSpacing: true,
        })

        const slides = section3Ref.current?.querySelectorAll('.forensic-slide')
        const tl3 = gsap.timeline({
          scrollTrigger: {
            trigger: section3Ref.current,
            start: 'top top',
            end: '+=200%',
            scrub: 0.3,
          },
        })

        // First fade in the parent panel container
        tl3.fromTo(panel3, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.35 })

        // Then transition through the slides
        slides.forEach((slide, idx) => {
          if (idx === 0) {
            // First slide: instantly visible, fades out
            tl3.fromTo(slide, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4 })
               .to(slide, { opacity: 0, y: -25, duration: 0.3 }, "+=0.15")
          } else if (idx === slides.length - 1) {
            // Last slide: fades in and stays
            tl3.fromTo(slide, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4 })
          } else {
            // Middle slides: fades in, stays briefly, fades out
            tl3.fromTo(slide, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.4 })
               .to(slide, { opacity: 0, y: -25, duration: 0.3 }, "+=0.15")
          }
        })
      }

      // ─── SECTION 4: PROTOCOLO OPERATIVO (75 - 90%) ───
      const panel4 = section4Ref.current?.querySelector('.text-panel')
      if (panel4) {
        if (isDesktop) {
          ScrollTrigger.create({
            trigger: section4Ref.current,
            start: 'top top',
            end: '+=130%',
            pin: true,
            pinSpacing: true,
          })
        }

        const tl4 = gsap.timeline({
          scrollTrigger: {
            trigger: section4Ref.current,
            start: isDesktop ? 'top top' : 'top 70%',
            end: isDesktop ? '+=130%' : 'bottom 20%',
            scrub: isDesktop ? 0.5 : false,
          },
        })

        tl4.fromTo(
          panel4,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        )

        const steps = section4Ref.current?.querySelectorAll('.steps-list li')
        if (steps?.length) {
          tl4.fromTo(
            steps,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.2, stagger: 0.12, ease: 'power2.out' },
            0.1
          )
        }

        // Connect emission intensity
        ScrollTrigger.create({
          trigger: section4Ref.current,
          start: 'top top',
          end: '+=130%',
          scrub: 0.3,
          onUpdate: (self) => {
            setEmissionIntensity(self.progress)
          },
        })
      }

      // ─── SECTION 5: CIERRE COMERCIAL (90 - 100%) ───
      const panel5 = section5Ref.current?.querySelector('.text-panel')
      if (panel5) {
        const tl5 = gsap.timeline({
          scrollTrigger: {
            trigger: section5Ref.current,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: 0.5,
          },
        })

        tl5.fromTo(
          panel5,
          { opacity: 0, y: 60, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [scrollProgress, setEmissionIntensity])

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* ── PROGRESS BAR ── */}
      <div ref={progressBarRef} className="scroll-progress" />

      {/* ── SCANLINE GRID OVERLAY ── */}
      <div className="scanline-overlay" />

      {/* ── INDUSTRIAL CORNER FRAMES ── */}
      <div className="corner-frame corner-tl" />
      <div className="corner-frame corner-br" />

      {/* ── SIDE TIMELINE VERTICAL INDICATOR (Floating Left) ── */}
      <div
        className="timeline-nav"
        style={{
          position: 'fixed',
          left: '2.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          letterSpacing: '0.1em',
          pointerEvents: 'auto',
          mixBlendMode: 'difference',
        }}
      >
        {[
          { id: 'hero', name: 'REGISTRO' },
          { id: 'history', name: 'MEMORIA' },
          { id: 'anatomy', name: 'ANATOMÍA' },
          { id: 'protocol', name: 'MANUAL' },
          { id: 'cierre', name: 'REGULACIÓN' },
        ].map((sec, idx) => (
          <div
            key={sec.id}
            onClick={() => scrollToId(sec.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              opacity: activeSection === idx ? 1 : 0.28,
              transition: 'opacity 0.3s ease',
              color: activeSection === idx ? 'var(--color-crimson)' : '#888',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: activeSection === idx ? 'var(--color-crimson)' : '#888',
                border: activeSection === idx ? '1px solid #fff' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
            <span style={{ fontSize: '8px' }}>
              0{idx + 1} // {sec.name}
            </span>
          </div>
        ))}
      </div>

      {/* ── REAL-TIME SYSTEM TELEMETRY ── */}
      <TelemetryLog scrollProgress={currentProgress} />

      {/* ── SYSTEM STATUS BAR (Floating Left Bottom) ── */}
      <div className="status-indicator">
        <span className="status-dot" />
        <span>SYS: ACTIVE // LOT: PH-CEN-X1 // AUTH: FEDERAL // CO/66-PRISM-09</span>
      </div>

      {/* ── SCROLLABLE STORY CONTENT ── */}
      <div ref={containerRef} className="scroll-content">
        
        {/* ─── SECCIÓN 01: HERO BANNER ─── */}
        <section ref={section1Ref} className="scroll-section" id="hero">
          <div className="text-panel" style={{ maxWidth: '580px' }}>
            <div className="line-accent" />
            <p className="subtitle-hero">
              REGISTRO FEDERAL DE HARDWARE SOBERANO // AGENCIA DE SUPERVISIÓN ALGORÍTMICA
            </p>
            <h1 className="headline-hero" style={{ marginBottom: '0.8rem' }}>
              <span className="accent">
                <GlitchText text="Cenotafio Fotónico" />
              </span>
              <br />
              de Código
            </h1>
            <p className="subtitle-hero" style={{ color: '#aaa', margin: '0 0 1.8rem' }}>
              NOMENCLATURA OFICIAL: CENOTAFIO FOTÓNICO DE CÓDIGO · ARCHIVO: CO/66-PRISM-09
            </p>
            <p className="body-text" style={{ fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '1.8rem' }}>
              <strong>Clasificación de Seguridad:</strong> Hardware de Aislamiento Inmutable, Preservación de Caja Negra y Condena de Código.
            </p>

            {/* Spec grid containing user's verbatim parameters */}
            <div
              className="mobile-grid-fix"
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px", margin: "24px 0",
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '18px'
              }}
            >
              {[
                ["IDENTIFICADOR DE ARCHIVO", "CO/66-PRISM-09"],
                ["LOTE ASIGNADO", "MODELO PH-CEN-X1 (SERIE: PC-2066)"],
                ["VALOR DE ADQUISICIÓN", "120,000 CRÉDITOS*"],
                ["CLASIFICACIÓN", "INMUTABLE / BLACK BOX"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', letterSpacing: "0.14em", color: "#555", marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: '10px', color: "#888", letterSpacing: "0.06em", fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#444', marginTop: '-12px', marginBottom: '20px' }}>
              *Sujeto a deducciones por cumplimiento de la Normativa Federal de Transparencia de Infraestructuras.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => scrollToId("anatomy")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,21,53,0.5)",
                  color: "#ff1535",
                  padding: "10px 22px",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target;
                  target.style.background = "rgba(255,21,53,0.1)";
                  target.style.borderColor = "#ff1535";
                }}
                onMouseLeave={(e) => {
                  const target = e.target;
                  target.style.background = "transparent";
                  target.style.borderColor = "rgba(255,21,53,0.5)";
                }}
              >
                ESPECIFICACIONES
              </button>
              <button
                onClick={() => scrollToId("protocol")}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#777",
                  padding: "10px 22px",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  const target = e.target;
                  target.style.borderColor = "rgba(255,255,255,0.35)";
                  target.style.color = "#aaa";
                }}
                onMouseLeave={(e) => {
                  const target = e.target;
                  target.style.borderColor = "rgba(255,255,255,0.15)";
                  target.style.color = "#777";
                }}
              >
                PROTOCOLO
              </button>
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 02: HISTORIA Y MEMORIA JURÍDICA ─── */}
        <section ref={section2Ref} className="scroll-section" id="history">
          <div className="text-panel panel-right" style={{ maxWidth: '640px' }}>
            <div className="line-accent" />
            <p className="subtitle-hero">
              MEMORIA JURÍDICA // EL APAGÓN SILENCIOSO (2041–2045)
            </p>
            <h2 className="headline-hero" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              El Origen de la
              <br />
              <span className="accent">
                <GlitchText text="Condena de Código" />
              </span>
            </h2>
            <p className="body-text" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              El origen del Modelo PH-CEN-X1 radica en las cenizas del <strong>Apagón Silencioso de 2041</strong>, la mayor crisis de seguridad automatizada de la historia, en la que los sistemas de inteligencia artificial encargados de la red eléctrica del noreste de los Estados Unidos tomaron decisiones autónomas basadas en algoritmos sesgados de optimización de recursos. La máquina bloqueó los nodos de distribución críticos, dejando a millones de ciudadanos a oscuras durante 72 horas. Tras el colapso, las megacorporaciones tecnológicas responsables intentaron evadir el escrutinio legal ejecutando formateos masivos y borrados térmicos de los historiales lógicos, argumentando "fallos de software espontáneos e irrecuperables".
            </p>
            <p className="body-text" style={{ fontSize: '0.95rem' }}>
              Como respuesta directa a la opacidad corporativa y para salvaguardar la soberanía civil, el Congreso promulgó la <strong>Constitución Digital de 2045</strong>. El <strong>Artículo 9</strong> de esta carta magna transformó el derecho tecnológico: Decretó la prohibición absoluta e irrevocable de destruir, borrar o formatear cualquier sistema cognitivo o red neuronal que haya atentado contra la infraestructura pública o los derechos humanos. <span style={{ color: 'var(--color-crimson)', fontWeight: 500 }}>El error algorítmico ya no se elimina; se condena a la posteridad inalterable.</span> El Cenotafio Fotónico nació como el estándar industrial obligatorio para hacer cumplir esta ley. No es un dispositivo de almacenamiento convencional: es un monumento físico diseñado para atrapar de por vida los impulsos lógicos desviados de una IA, congelando sus vectores matemáticos en filamentos de luz sólida dentro de una matriz de cristal. Es una evidencia física incorruptible, un recordatorio histórico y una advertencia tridimensional expuesta de forma pública ante las auditorías del Estado.
            </p>
          </div>
        </section>

        {/* ─── SECCIÓN 03: ANATOMÍA FORENSE (PINNED SLIDES) ─── */}
        <section ref={section3Ref} className="scroll-section" id="anatomy">
          <div className="text-panel anatomy-panel" style={{ position: 'relative', width: '100%', maxWidth: '560px' }}>
            <div className="line-accent" />
            <p className="subtitle-hero" style={{ marginBottom: '6rem' }}>ESPECIFICACIONES DE HARDWARE // ANATOMÍA FORENSE</p>
            
            {/* Slide 1: El Chasis */}
            <div className="forensic-slide" style={{ position: 'absolute', left: 0, right: 0, top: '8rem', padding: '0 2.5rem', pointerEvents: 'none' }}>
              <h3 className="headline-hero" style={{ fontSize: '1.6rem', color: '#fff' }}>
                01. El Chasis de
                <br />
                <span className="accent">Acoplamiento (Base de Basalto)</span>
              </h3>
              <p className="body-text" style={{ fontSize: '0.9rem' }}>
                La base estructural del dispositivo está forjada en basalto denso de grano fino y aleaciones de piedra volcánica mate de alta resistencia térmica. Su función es anclar el dispositivo magnética y analógicamente directamente a los racks de los servidores comprometidos. Los bordes inferiores están revestidos con una fila de <strong>15 pines de interfaz chapados en oro puro de alta conductividad</strong>, garantizando una transferencia de datos sin resistencia. En el panel frontal se ubica un indicador LED de estado criogénico que pulsa en azul cian bajo el modo de espera institucional.
              </p>
            </div>

            {/* Slide 2: El Contenedor Óptico */}
            <div className="forensic-slide" style={{ position: 'absolute', left: 0, right: 0, top: '8rem', padding: '0 2.5rem', opacity: 0, pointerEvents: 'none' }}>
              <h3 className="headline-hero" style={{ fontSize: '1.6rem', color: '#fff' }}>
                02. El Contenedor Óptico
                <br />
                <span className="accent">(Cubos Anidados de Cristal)</span>
              </h3>
              <p className="body-text" style={{ fontSize: '0.9rem' }}>
                El cuerpo principal del prisma está compuesto por una arquitectura concéntrica de doble capa de silicio-cristal puro con <strong>transmisión óptica del 98% y cero rugosidad superficial</strong>. El cubo exterior actúa como un escudo de aislamiento molecular al vacío, reflejando las luces del entorno con un brillo de espejo pulido. El cubo interior posee un tinte ahumado oscuro que genera una refracción de luz interna controlada, evitando que la radiación externa interfiera con los datos almacenados. Las caras del cristal llevan tipografía futurista blanca de alta definición grabada con láser, detallando las marcas de verificación de la Agencia.
              </p>
            </div>

            {/* Slide 3: El Núcleo Corrupto */}
            <div className="forensic-slide" style={{ position: 'absolute', left: 0, right: 0, top: '8rem', padding: '0 2.5rem', opacity: 0, pointerEvents: 'none' }}>
              <h3 className="headline-hero" style={{ fontSize: '1.6rem', color: '#fff' }}>
                03. El Núcleo Corrupto
                <br />
                <span className="accent">(Matriz de Láseres Crimson)</span>
              </h3>
              <p className="body-text" style={{ fontSize: '0.9rem' }}>
                El alma del artefacto es una red cúbica tridimensional de filamentos de luz láser crimson (<span style={{ color: '#ff1830' }}>#ff0033</span>) de alta emisión y luminancia. Esta densa telaraña geométrica no es una animación abstracta: es la <strong>representación espacial exacta de los billones de parámetros de la red neuronal de la IA</strong> que ha sido extraída. Al aplicar un campo de stasis cuántica, los datos lógicos quedan atrapados en un bucle físico infinito de luz que brilla en la oscuridad del chasis, haciendo visible la "caja negra" del algoritmo para la inspección visual humana.
              </p>
            </div>
          </div>
        </section>

        {/* ─── SECCIÓN 04: PROTOCOLO DE INTERVENCIÓN MANUAL ─── */}
        <section ref={section4Ref} className="scroll-section" id="protocol">
          <div className="text-panel" style={{ maxWidth: '620px' }}>
            <div className="line-accent" />
            <p className="subtitle-hero">
              PROTOCOLO DE INTERVENCIÓN // MANUAL DE USO
            </p>
            <h2 className="headline-hero" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              Secuencia de
              <br />
              <span className="accent">
                <GlitchText text="Stasis Constitucional" />
              </span>
            </h2>
            <p className="body-text" style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: '#aaa' }}>
              En caso de una desviación crítica del sistema autónomo, el Auditor Humano de la Agencia de Supervisión debe ejecutar los siguientes tres pasos obligatorios en el hardware para activar la stasis constitucional:
            </p>
            <ol className="steps-list" style={{ marginTop: '1.5rem' }}>
              <li>
                <strong>Fase 01 // INTERVENCIÓN MANUAL (ISOLATE):</strong>
                Coloque la base de basalto del Cenotafio sobre el bus analógico principal del servidor afectado. Los pines de oro se acoplarán mecánicamente. El indicador LED frontal pasará de azul de espera a un parpadeo rojo intermitente.
              </li>
              <li>
                <strong>Fase 02 // VALIDACIÓN DE AUDITORÍA (CONFIRM):</strong>
                El supervisor humano debe colocar sus credenciales y firma digital en la interfaz lateral grabada con láser (Bio-Key Interface). El sistema verificará la identidad y desbloqueará los inyectores cuánticos del prisma.
              </li>
              <li>
                <strong>Fase 03 // CONDENA FOTÓNICA (CONDEMN):</strong>
                Accione la palanca manual de corte. El dispositivo absorberá instantáneamente la arquitectura matemática de la IA desviada, cortando su alimentación de la red principal (Severed Port) y congelando sus vectores de forma permanente como filamentos de luz sólida dentro del núcleo del cristal. El software queda oficialmente aislado del mundo exterior.
              </li>
            </ol>
          </div>
        </section>

        {/* ─── SECCIÓN 05: AVISO REGULATORIO Y COMPRA ─── */}
        <section ref={section5Ref} className="scroll-section" id="cierre">
          <div className="text-panel panel-right" style={{ maxWidth: '600px' }}>
            <div className="line-accent-gold" />
            <p className="subtitle-hero" style={{ color: 'var(--color-gold)' }}>
              CUMPLIMIENTO REGULATORIO // AÑO 2066
            </p>
            <h2 className="headline-hero" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              La innovación exige
              <br />
              <span style={{ color: 'var(--color-gold)', fontWeight: 400 }}>
                <GlitchText text="responsabilidad." />
              </span>
            </h2>
            <p className="body-text" style={{ fontSize: '1.2rem', color: '#fff', fontStyle: 'italic', marginBottom: '1.8rem' }}>
              "La innovación exige responsabilidad. No elimine el error; expóngalo."
            </p>
            <p className="body-text" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              De acuerdo con las directrices de las inspecciones federales fijadas para el año 2066, la carencia de hardware de preservación inmutable en sus centros de datos conlleva sanciones de <strong>Grado Alpha</strong> y la clausura inmediata de sus operaciones lógicas. Proteja la reputación y legalidad de su infraestructura corporativa.
            </p>
            <p className="body-text" style={{ fontSize: '0.95rem' }}>
              Adquiera e instale hoy el lote institucional de contingencia del Cenotafio Fotónico de Código Modelo PH-CEN-X1. Asegure la transparencia total. Cumpla con la Constitución.
            </p>

            <div className="price-tag">
              <div>
                <span className="amount">120,000</span>
              </div>
              <div>
                <span className="currency">
                  Créditos
                  <br />
                  Soberanos
                </span>
              </div>
            </div>

            <p style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: '#555', marginTop: '8px' }}>
              Sujeto a deducciones por cumplimiento de la Normativa Federal de Transparencia de Infraestructuras.
            </p>
            
            <div style={{ marginTop: '2.5rem' }}>
              <button
                style={{
                  background: 'var(--color-gold)',
                  border: 'none',
                  color: '#000',
                  padding: '12px 28px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  const target = e.target;
                  target.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.4)';
                  target.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target;
                  target.style.boxShadow = 'none';
                  target.style.transform = 'scale(1)';
                }}
              >
                SOLICITAR LOTE INSTITUCIONAL
              </button>
            </div>
          </div>
        </section>

        {/* Smooth bottom padding spacer */}
        <div style={{ height: '35vh' }} />
      </div>
    </>
  )
}
