import React, { useEffect, useMemo, useRef, useState } from "react";

// Safety Pomodoro — single‑file React prototype
// TailwindCSS is assumed in the preview. No external UI libs required.
// Keyboard shortcuts: [Space]=Start/Stop, R=Reset, 2/3/4 minute presets, +/- fine‑tune

export default function App() {
  // --- Timer state
  const [minutes, setMinutes] = useState(25); // planned minutes (0–60)
  const [remaining, setRemaining] = useState(25 * 60); // in seconds
  const [running, setRunning] = useState(false);
  const [lastTick, setLastTick] = useState<number | null>(null);

  // --- Audio state
  const [ambient, setAmbient] = useState<"none" | "brown">("none");
  const [volume, setVolume] = useState(0.25);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const brownNoiseRef = useRef<AudioWorkletNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // --- Tips
  const tips = useMemo(() => SAFETY_TIPS, []);
  const [tip, setTip] = useState(() => pickRandom(tips));

  // --- Derived values
  const total = Math.max(0, Math.min(60, minutes)) * 60;
  const progress = total > 0 ? (total - remaining) / total : 0;

  // Sync remaining when minutes changed (only if not running)
  useEffect(() => {
    if (!running) setRemaining(Math.round(minutes * 60));
  }, [minutes, running]);

  // Timer loop using requestAnimationFrame for smoothness
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!running) {
        setLastTick(null);
        return;
      }
      if (lastTick == null) {
        setLastTick(t);
        return;
      }
      const dt = (t - lastTick) / 1000; // seconds
      setLastTick(t);
      setRemaining((s) => {
        const next = Math.max(0, s - dt);
        if (s > 0 && next === 0) {
          // finished
          setRunning(false);
          chime();
          setTip(pickRandom(tips));
        }
        return next;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, lastTick, tips]);

  // Rotate tips every 60s while running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTip(pickRandom(tips)), 60_000);
    return () => clearInterval(id);
  }, [running, tips]);

  // --- Ambient audio (brown noise via AudioWorklet)
  useEffect(() => {
    if (ambient === "none") {
      stopAmbient();
      return;
    }
    startAmbient();
    return () => stopAmbient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient]);

  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }, [volume]);

  function ensureAudioContext() {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
    }
    return audioCtxRef.current!;
  }

  async function startAmbient() {
    if (ambient !== "brown") return;
    const ctx = ensureAudioContext();
    if (!ctx) return;
    await ctx.resume();

    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = volume;
      gainRef.current.connect(ctx.destination);
    }

    // Register a simple Brown Noise worklet if not present
    if (!(ctx as any)._brownLoaded) {
      const processorCode = `class BrownNoise extends AudioWorkletProcessor {\n  constructor(){\n    super();\n    this.lastOut = 0;\n  }\n  process(inputs, outputs, parameters){\n    const output = outputs[0];\n    for (let channel = 0; channel < output.length; channel++) {\n      const out = output[channel];\n      for (let i = 0; i < out.length; i++) {\n        const white = Math.random() * 2 - 1;\n        this.lastOut = (this.lastOut + (0.02 * white)) / 1.02;\n        out[i] = this.lastOut * 3.5;\n      }\n    }\n    return true;\n  }\n}\nregisterProcessor('brown-noise', BrownNoise);`;
      const blob = new Blob([processorCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      (ctx as any)._brownLoaded = true;
    }

    if (!brownNoiseRef.current) {
      brownNoiseRef.current = new AudioWorkletNode(ctx, "brown-noise");
      brownNoiseRef.current.connect(gainRef.current!);
    }
  }

  function stopAmbient() {
    brownNoiseRef.current?.disconnect();
    brownNoiseRef.current = null;
  }

  // End‑of‑session chime
  function chime() {
    const ctx = ensureAudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = 0.001;
    o.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    o.start();
    o.frequency.exponentialRampToValueAtTime(440, now + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    o.stop(now + 1.05);
  }

  // Controls
  const onStartStop = () => setRunning((r) => !r);
  const onReset = () => {
    setRunning(false);
    setRemaining(minutes * 60);
  };
  const setPreset = (m: number) => {
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); onStartStop(); }
      if (e.key.toLowerCase() === "r") onReset();
      if (e.key === "+") setMinutes((m) => Math.min(60, m + 1));
      if (e.key === "-") setMinutes((m) => Math.max(0, m - 1));
      if (e.key === "2") setPreset(20);
      if (e.key === "3") setPreset(30);
      if (e.key === "4") setPreset(40);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = Math.floor(remaining % 60).toString().padStart(2, "0");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column — Timer */}
        <div className="relative rounded-3xl bg-white shadow-xl p-6 overflow-hidden">
          <HazardRibbon />
          <header className="flex items-center gap-3">
            <HardHatIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-semibold leading-tight">Safety Pomodoro</h1>
              <p className="text-sm text-neutral-500">Фокус‑сессии для профессионалов охраны труда</p>
            </div>
          </header>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center justify-center">
              <RadialDial
                minutes={minutes}
                setMinutes={(m) => setMinutes(clamp(m, 0, 60))}
              />
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => setMinutes((m) => clamp(m - 1, 0, 60))} className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm">−1</button>
                <div className="text-sm text-neutral-600">Минуты: <span className="font-medium text-neutral-900">{minutes}</span></div>
                <button onClick={() => setMinutes((m) => clamp(m + 1, 0, 60))} className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-sm">+1</button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <ProgressRing progress={progress} />
              <div className="mt-3 text-5xl font-semibold tabular-nums tracking-tight" aria-live="polite">{mm}:{ss}</div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {[20, 30, 40].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPreset(m)}
                    className={`px-3 py-1.5 rounded-full border text-sm ${minutes===m ? "bg-emerald-600 text-white border-emerald-700" : "bg-white hover:bg-neutral-50 border-neutral-200"}`}
                    aria-label={`Установить ${m} минут`}
                  >{m} мин</button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={onStartStop} className={`px-4 py-2 rounded-xl font-medium shadow ${running ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                  {running ? "Пауза" : "Старт"}
                </button>
                <button onClick={onReset} className="px-4 py-2 rounded-xl font-medium bg-white border border-neutral-200 hover:bg-neutral-50">
                  Сброс
                </button>
              </div>
            </div>
          </div>

          <footer className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <SoundIcon className="w-5 h-5" />
              <label className="text-sm text-neutral-600">Фон:</label>
              <select
                value={ambient}
                onChange={(e) => setAmbient(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-neutral-200 bg-white text-sm"
                aria-label="Выбор фонового звука"
              >
                <option value="none">Без звука</option>
                <option value="brown">Brown noise</option>
              </select>
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="ml-2"
                aria-label="Громкость"
              />
            </div>
            <div className="text-xs text-neutral-500">Space — старт/пауза · R — сброс · 2/3/4 — пресеты</div>
          </footer>
        </div>

        {/* Right column — Safety tips & micro‑features */}
        <div className="rounded-3xl bg-white shadow-xl p-6">
          <section>
            <div className="flex items-center gap-2 mb-2">
              <ShieldIcon className="w-6 h-6" />
              <h2 className="text-lg font-semibold">Совет по безопасности</h2>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50">
              <p className="text-neutral-800 leading-relaxed">{tip}</p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setTip(pickRandom(tips))} className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-sm">Еще совет</button>
                <span className="text-xs text-neutral-500">Новые советы каждые 60 сек во время сессии</span>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MiniCard
              title="Сессии"
              value={`${Math.round((total - remaining) / 60)} / ${Math.round(total/60)} мин`}
              hint="Прогресс текущего цикла"
            />
            <MiniCard
              title="Фокус"
              value={`${Math.round(progress * 100)}%`}
              hint="Доля выполненного времени"
            />
          </section>

          <section className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <ChecklistIcon className="w-5 h-5" />
              <h3 className="font-medium">Микро‑задачи</h3>
            </div>
            <MicroTasks />
          </section>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, progress)) * c;
  return (
    <svg width={size} height={size} className="drop-shadow-sm">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2}
        cy={size/2}
        r={r}
        stroke="url(#g)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        fill="none"
      />
    </svg>
  );
}

function RadialDial({ minutes, setMinutes }: { minutes: number; setMinutes: (m:number)=>void }) {
  const size = 220;
  const center = size / 2;
  const radius = 90;
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const onUp = () => setDrag(false);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const setFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const pt = ("touches" in e && e.touches.length)
      ? { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      : { x: (e as any).clientX - rect.left, y: (e as any).clientY - rect.top };
    const dx = pt.x - center;
    const dy = pt.y - center;
    let angle = Math.atan2(dy, dx); // -PI..PI
    angle = angle < -Math.PI/2 ? angle + 2*Math.PI : angle; // keep top as start
    const deg = (angle * 180) / Math.PI; // -90..270
    const pct = (deg + 90) / 360; // 0..1
    const mins = Math.round(pct * 60);
    setMinutes(mins);
  };

  const pct = minutes / 60;
  const angle = pct * 360 - 90;
  const knobX = center + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = center + radius * Math.sin((angle * Math.PI) / 180);

  // Ticks every 5 minutes
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const x1 = center + (radius - 8) * Math.cos(a);
    const y1 = center + (radius - 8) * Math.sin(a);
    const x2 = center + (radius + 8) * Math.cos(a);
    const y2 = center + (radius + 8) * Math.sin(a);
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9ca3af" strokeWidth={i%3===0?2:1} />;
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={ref}
        width={size}
        height={size}
        onMouseDown={(e) => { setDrag(true); setFromEvent(e); }}
        onMouseMove={(e) => { if (drag) setFromEvent(e); }}
        onTouchStart={(e) => { setDrag(true); setFromEvent(e); }}
        onTouchMove={(e) => { if (drag) setFromEvent(e); }}
        className="cursor-pointer select-none"
      >
        <defs>
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3f4f6" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={radius + 18} fill="url(#dialGrad)" stroke="#e5e7eb" />
        {ticks}
        <text x={center} y={center} textAnchor="middle" dominantBaseline="central" className="fill-neutral-700" style={{fontSize: 34, fontWeight: 700}}>
          {minutes}
        </text>
        <text x={center} y={center + 26} textAnchor="middle" className="fill-neutral-500" style={{fontSize: 12}}>мин</text>
        <line x1={center} y1={center} x2={knobX} y2={knobY} stroke="#10b981" strokeWidth={4} />
        <circle cx={knobX} cy={knobY} r={10} fill="#10b981" stroke="#065f46" />
      </svg>
      <div className="mt-2 text-xs text-neutral-500">Поверните циферблат (0–60 мин)</div>
    </div>
  );
}

function MiniCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{hint}</div>
    </div>
  );
}

function MicroTasks() {
  const [items, setItems] = useState<Array<{ id: number; text: string; done: boolean }>>([
    { id: 1, text: "Проверить состояние СИЗ у команды", done: false },
    { id: 2, text: "Просмотреть последние SIF‑риски", done: false },
    { id: 3, text: "План обхода зоны с повышенным риском", done: false },
  ]);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setItems((arr) => [{ id: Date.now(), text: text.trim(), done: false }, ...arr]);
    setText("");
  };
  const toggle = (id: number) => setItems((arr) => arr.map((x) => x.id === id ? { ...x, done: !x.done } : x));
  const remove = (id: number) => setItems((arr) => arr.filter((x) => x.id !== id));

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200"
          placeholder="Добавить микро‑задачу"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">Добавить</button>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 bg-white">
            <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} className="w-4 h-4" />
            <span className={`flex-1 ${it.done ? "line-through text-neutral-400" : ""}`}>{it.text}</span>
            <button onClick={() => remove(it.id)} className="text-xs px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200">Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HazardRibbon() {
  return (
    <div className="absolute inset-x-0 -top-6 pointer-events-none select-none">
      <div className="mx-[-2rem] rotate-[-3deg] h-8 flex items-center justify-center">
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,_#111_0px,_#111_16px,_#f59e0b_16px,_#f59e0b_32px)] opacity-90" />
      </div>
    </div>
  );
}

// --- Icons (inline SVG for zero dependencies)
function HardHatIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 13a9 9 0 0 1 18 0v3a2 2 0 0 1-2 2h-2v-2a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v2H5a2 2 0 0 1-2-2v-3z" />
      <path d="M12 4v4m-5 10h10" />
    </svg>
  );
}
function SoundIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10v4h4l6 5V5l-6 5H4z" />
    </svg>
  );
}
function ShieldIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4z" />
    </svg>
  );
}
function ChecklistIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 7h11M9 12h11M9 17h11M4 7h.01M4 12h.01M4 17h.01" />
    </svg>
  );
}

function clamp(n: number, a: number, b: number) { return Math.min(b, Math.max(a, n)); }
function pickRandom<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

const SAFETY_TIPS = [
  "Перед началом работы проведите короткий JSA/РА – 60 секунд анализа спасают часы простоя.",
  "Всегда уточняйте LOTO‑границы: кто владеет ключом и где бирка?",
  "Перенесите тяжёлые предметы ближе к корпусу – снижает риск травм спины.",
  "Три точки опоры при подъёме по лестнице – не исключение, а правило.",
  "СИЗ работают только когда их носят: очки + перчатки + каска.",
  "Снижение уровня шума на 3 дБ – это как отключить половину источников.",
  "Маршрут эвакуации должен быть известен до тревоги, а не во время неё.",
  "Перед запуском – проверка блокировок конвейера и ограждений.",
  "CO₂ тяжелее воздуха – проветривайте нижние уровни и колодцы.",
  "Фиксируйте почти‑несчастные случаи – это бесплатные уроки.",
  "При работе с химикатами: правило P.A.S.S. для огнетушителей – Pull, Aim, Squeeze, Sweep.",
  "Тележки и роклы: пальцы вне опасной зоны роликов.",
  "Тренируйте команду распознавать SIF‑экспозиции в ежедневных обходах.",
  "Проверяйте срок годности кассет для респираторов перед сменой.",
  "Очистка и 5S на рабочем месте – лучший инструмент предотвращения спотыкания.",
  "Убедитесь, что временные ограждения выдерживают боковую нагрузку.",
  "Надевайте блокиратор на вилку – не полагайтесь на устные договорённости.",
  "Зона погрузки: стой вне траектории поворота погрузчика.",
  "Кросс‑чек партнёра перед замкнутым пространством – правило двух человек.",
  "Проверьте исправность аварийного душа и дней глаз.",
  "Не обходите межблокировки – это приводит к слепым зонам риска.",
  "Держите огнетушители свободными от складирования и легко доступными.",
  "Переходя дорогу цеха – контакт глазами с водителем техники.",
  "Электрощитовые – только допущенный персонал и диэлектрические СИЗ.",
  "Правильная эргономика ПК: экран на уровне глаз, локти ~90°.",
  "При использовании ножа – рез от себя, не к себе.",
  "Дефекты напольной разметки = источник спотыкания. Обновляйте своевременно.",
  "Проверьте давление в гидролиниях перед отсоединением.",
  "Не храните баллоны без колпаков – риск срыва вентиля.",
  "Перед сменой – короткая беседа по рискам дня (toolbox talk)."
];
