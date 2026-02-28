const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─────────────────────────────────────────
   MINI CALENDAR
───────────────────────────────────────── */
const MiniCalendar = ({ language }) => {
  const [currentDate] = useState(new Date());
  const today = currentDate.getDate();
  const month = currentDate.getMonth();
  const year  = currentDate.getFullYear();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = {
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  };
  const dayNames = {
    ru: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    en: ['Su','Mo','Tu','We','Th','Fr','Sa'],
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="text-center mb-3">
        <span className="text-sm font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {monthNames[language][month]} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames[language].map(d => (
          <div key={d} className="h-6 flex items-center justify-center text-xs font-semibold" style={{ color: 'rgba(212,175,55,0.55)', fontFamily: 'Montserrat, sans-serif' }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className="h-7 flex items-center justify-center text-xs rounded-lg transition-all"
            style={day === today
              ? { background: `linear-gradient(135deg, #D4AF37, #C4A032)`, color: '#0B1D3A', fontWeight: 700, fontFamily: 'Montserrat, sans-serif', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }
              : { color: day ? 'rgba(255,255,255,0.60)' : 'transparent' }
            }
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   BRAND CONSTANTS
───────────────────────────────────────── */
const BRAND = {
  dark:      '#0B1D3A',
  steel:     '#1E3A5F',
  lightSteel:'#2A4F7A',
  gold:      '#D4AF37',
  goldHover: '#C4A032',
  softGold:  '#E8D48B',
};

const glassStyle = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid rgba(255,255,255,0.10)',
};

const glassGoldStyle = {
  background: 'rgba(212,175,55,0.07)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid rgba(212,175,55,0.22)',
};

/* ─────────────────────────────────────────
   HEX BACKGROUND
───────────────────────────────────────── */
const HexBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexagons" x="0" y="0" width="58" height="50" patternUnits="userSpaceOnUse">
          <polygon
            points="29,2 56,16 56,34 29,48 2,34 2,16"
            fill="none"
            stroke={BRAND.gold}
            strokeWidth="0.4"
            opacity="0.12"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexagons)" />
    </svg>
  </div>
);

/* ─────────────────────────────────────────
   RIPPLE BUTTON
───────────────────────────────────────── */
const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 600);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  return (
    <button
      className={`ripple-button relative overflow-hidden ${className}`}
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onClick && onClick(e);
      }}
      {...props}
    >
      {isRippling && (
        <span
          className="absolute w-5 h-5 bg-white/20 rounded-full pointer-events-none"
          style={{ left: coords.x - 10, top: coords.y - 10, animation: 'ripple-effect 0.6s ease-out forwards' }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

/* ─────────────────────────────────────────
   GRADIENT BORDER BUTTON (Старт/Пауза)
───────────────────────────────────────── */
const GradientBorderButton = ({ children, onClick, isActive = false, className = '', ...props }) => (
  <button
    className={`gradient-border-btn relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-none p-[2px] ${className}`}
    onClick={onClick}
    {...props}
  >
    <span
      className="gradient-border-span relative z-[1] w-full rounded-2xl px-8 py-4 text-lg font-bold backdrop-blur-md transition-all font-heading"
      style={{
        fontFamily: 'Montserrat, sans-serif',
        background: isActive
          ? `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})`
          : 'rgba(255,255,255,0.09)',
        color: isActive ? BRAND.dark : 'white',
        border: isActive ? 'none' : '1px solid rgba(255,255,255,0.18)',
        boxShadow: isActive ? `0 4px 20px rgba(212,175,55,0.4)` : 'none',
      }}
    >
      {children}
    </span>
  </button>
);

/* ─────────────────────────────────────────
   FADE IN WRAPPER
───────────────────────────────────────── */
const FadeIn = ({ children, delay = 0, duration = 600, className = '' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(22px)', transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────
   PULSE RINGS (when timer running)
───────────────────────────────────────── */
const PulseRings = ({ isRunning }) => {
  if (!isRunning) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[0, 1].map(i => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            border: `1px solid rgba(212,175,55,0.35)`,
            animation: `pulse-ring ${1.6 + i * 0.8}s ease-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   SESSION DOTS (pomodoro cycle 1-4)
───────────────────────────────────────── */
const SessionDots = ({ sessionCount, language }) => {
  const cycleNum  = Math.floor(sessionCount / 4) + 1;
  const cyclePos  = sessionCount % 4;

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <div className="flex gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`session-dot ${i < cyclePos ? 'done' : 'empty'}`}
          />
        ))}
      </div>
      <span className="text-xs tracking-widest uppercase" style={{ color: `rgba(212,175,55,0.55)`, fontFamily: 'Montserrat, sans-serif' }}>
        {language === 'ru' ? `Цикл ${cycleNum}` : `Cycle ${cycleNum}`}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────
   ANIMATED NUMBER (count-up)
───────────────────────────────────────── */
const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end   = value;
    if (start === end) return;
    const startTime = performance.now();
    const duration  = 700;
    const step = (now) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(step);
      else prevRef.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);

  return <span>{display}</span>;
};

/* ─────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────── */
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [isVisible, onClose]);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50"
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '80px'})`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer"
        onClick={onClose}
        style={{
          background: `linear-gradient(135deg, ${BRAND.dark}, ${BRAND.steel})`,
          border: `1px solid rgba(212,175,55,0.40)`,
          boxShadow: '0 8px 40px rgba(212,175,55,0.3), 0 2px 12px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})` }}
        >
          <i className="fas fa-check text-sm" style={{ color: BRAND.dark }}></i>
        </div>
        <span className="text-white font-semibold whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {message}
        </span>
        <i className="fas fa-times text-white/30 ml-2 text-xs hover:text-white/60 transition-colors"></i>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   GOLD DIVIDER
───────────────────────────────────────── */
const GoldDivider = () => (
  <div className="brand-divider" />
);

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
const StatCard = ({ icon, iconColor, label, value, bg, border }) => (
  <div
    className="flex justify-between items-center p-3 rounded-xl"
    style={{ background: bg, border: `1px solid ${border}` }}
  >
    <span className="text-white/65 text-sm flex items-center gap-2">
      <i className={`fas ${icon}`} style={{ color: iconColor }}></i>
      {label}
    </span>
    <span className="text-xl font-bold" style={{ color: iconColor, fontFamily: 'Montserrat, sans-serif' }}>
      <AnimatedNumber value={value} />
    </span>
  </div>
);

/* ─────────────────────────────────────────
   QUICK NOTES
───────────────────────────────────────── */
function QuickNotes({ onTaskToggle, translations }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pomodoroNotes') || '[]'); }
    catch { return []; }
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('pomodoroNotes', JSON.stringify(notes));
    onTaskToggle(notes.filter(n => n.completed).length);
  }, [notes, onTaskToggle]);

  const addNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, { id: Date.now(), text: newNote.trim(), completed: false }]);
      setNewNote('');
    }
  };

  const toggleNote = id => setNotes(prev => prev.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  const deleteNote = id => setNotes(prev => prev.filter(n => n.id !== id));

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder={translations.addTask}
          className="flex-1 px-3 py-2 rounded-xl text-white text-sm focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
          onFocus={e => e.target.style.borderColor = `rgba(212,175,55,0.5)`}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
        />
        <button
          onClick={addNote}
          className="px-4 py-2 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})`, color: BRAND.dark, boxShadow: `0 2px 10px rgba(212,175,55,0.35)` }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notes.map(note => (
          <div
            key={note.id}
            className="flex items-center gap-2 p-2 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              type="checkbox"
              checked={note.completed}
              onChange={() => toggleNote(note.id)}
              className="w-4 h-4 cursor-pointer flex-shrink-0"
              style={{ accentColor: BRAND.gold }}
            />
            <span className={`flex-1 text-sm transition-all ${note.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
              {note.text}
            </span>
            <button onClick={() => deleteNote(note.id)} className="text-red-400/50 hover:text-red-400 text-xs transition-colors flex-shrink-0">
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-center text-white/25 text-xs py-3" style={{ fontFamily: 'Lora, serif', fontStyle: 'italic' }}>
            {translations.addTask}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN APP
───────────────────────────────────────── */
function App() {
  const [minutes,       setMinutes]      = useState(25);
  const [seconds,       setSeconds]      = useState(0);
  const [totalMinutes,  setTotalMinutes] = useState(25);
  const [isRunning,     setIsRunning]    = useState(false);
  const [sessionCount,  setSessionCount] = useState(0);
  const [ambientSound,  setAmbientSound] = useState('none');
  const [volume,        setVolume]       = useState(0.5);
  const [language,      setLanguage]     = useState('ru');
  const [todayMinutes,  setTodayMinutes] = useState(0);
  const [streak,        setStreak]       = useState(0);
  const [completedTasks,setCompletedTasks]= useState(0);
  const [toast,         setToast]        = useState({ visible: false, message: '' });
  const audioRef = useRef(null);

  /* ── Translations ── */
  const translations = {
    ru: {
      title:'Safety Pomodoro', subtitle:'ПРОДУКТИВНАЯ БЕЗОПАСНОСТЬ',
      tagline:'Экспертиза × ИИ × Результат',
      onPause:'На паузе', inWork:'В работе',
      start:'Старт', pause:'Пауза', reset:'Сброс',
      minutes:'мин', setTime:'Установить время',
      backgroundSounds:'Фоновые звуки',
      silence:'Тишина', forest:'Лес', forest2:'Лес 2', ocean:'Океан', construction:'Стройка',
      safetyTip:'Совет по безопасности', newTip:'Новый совет',
      dailyStats:'Статистика дня', series:'Серия', sessions:'Сессий',
      minutesCount:'Минут', tasks:'Задач',
      dailyTasks:'Задачи на день', addTask:'Добавить задачу...',
      completed:'Завершено', madeAt:'Создано с',
      sessionDone:'🎉 Сессия завершена! Время для перерыва',
      calendar:'Календарь',
    },
    en: {
      title:'Safety Pomodoro', subtitle:'PRODUCTIVE SAFETY',
      tagline:'Expertise × AI × Results',
      onPause:'On pause', inWork:'In work',
      start:'Start', pause:'Pause', reset:'Reset',
      minutes:'min', setTime:'Set time',
      backgroundSounds:'Background sounds',
      silence:'Silence', forest:'Forest', forest2:'Forest 2', ocean:'Ocean', construction:'Construction',
      safetyTip:'Safety tip', newTip:'New tip',
      dailyStats:'Daily statistics', series:'Series', sessions:'Sessions',
      minutesCount:'Minutes', tasks:'Tasks',
      dailyTasks:'Daily tasks', addTask:'Add task...',
      completed:'Completed', madeAt:'Made with',
      sessionDone:'🎉 Session complete! Time for a break',
      calendar:'Calendar',
    },
  };

  /* ── Safety Tips ── */
  const safetyTipsData = {
    ru: [
      "🦺 Проверка и правильное использование СИЗ — ключевой элемент культуры личной ответственности",
      "⚠️ Правило трёх точек опоры при работе на высоте — стандарт мирового уровня (ANSI Z359)",
      "🔒 LOTO: блокировка и маркировка — предотвращают 80% инцидентов с оборудованием",
      "👀 5S и визуальное управление — фундамент безопасной производственной среды",
      "🚨 Тренируйтесь в эвакуации: знание маршрутов важно, но практика решает всё",
      "🧯 Проверка огнетушителей — часть ежедневного safety walk",
      "📋 JSA/TRA перед работой — анализ рисков до старта снижает вероятность инцидента на 60%",
      "🦾 Эргономика — инвестиция в здоровье и долгосрочную продуктивность персонала",
      "⚡ Электробезопасность: тест изоляции и проверка маркировки — критично перед включением",
      "🌡️ Управление тепловым стрессом — часть программы охраны здоровья (ISO 45001 §8.1)",
      "🔊 Активное управление шумом — шаг к снижению профзаболеваний слуха",
      "🧪 MSDS/паспорт безопасности — всегда должен быть доступен при работе с химикатами",
      "🚧 Физические и визуальные барьеры — инструмент культуры предсказуемой безопасности",
      "📱 Отвлечение от работы = нарушение golden rules. Фокус = сохранённые жизни",
      "🤝 Safe buddy system — двойной контроль при high-risk работах",
      "💨 Газоанализ и вентиляция замкнутых пространств — обязательное условие допуска",
      "🏗️ Инспекция лесов, подмостей и вышек — часть программы разрешений на работу",
      "🚛 Минимальная безопасная дистанция 3 м от техники — стандарт ISO/ANSI",
      "🔧 Инструмент без дефектов = нулевая толерантность к компромиссам по безопасности",
      "📊 Near-miss = бесплатный урок. Анализируйте и делитесь выводами в команде",
      "👂 Лидерство в безопасности начинается с активного слушания сотрудников",
      "📢 Поведенческие наблюдения (BBS) — выявляют скрытые риски до происшествия",
      "🏅 Zero Harm — не лозунг, а стратегия постоянного улучшения",
      "🌍 Безопасность = ключевой элемент устойчивого развития и ESG-отчётности",
      "💡 Каждый риск-ассессмент — возможность повысить зрелость safety culture",
      "🤲 Останови работу, если есть сомнение. Stop Work Authority — право каждого",
      "🧭 Safety walk лидеров — инструмент доверия, а не контроля",
      "🧠 Микропаузы и mindfulness снижают количество ошибок из-за усталости",
      "🔄 Инциденты повторяются там, где не учатся на прошлых уроках",
      "📈 Индекс вовлечённости сотрудников в безопасность = KPI зрелости компании",
    ],
    en: [
      "🦺 Proper PPE inspection and usage is a key element of personal responsibility culture",
      "⚠️ Three-point contact rule for work at height — world-class standard (ANSI Z359)",
      "🔒 LOTO: Lockout and Tagout — prevents 80% of equipment incidents",
      "👀 5S and visual management — foundation of a safe production environment",
      "🚨 Practice evacuation drills: knowing routes is important, but practice makes perfect",
      "🧯 Fire extinguisher inspection — part of daily safety walk",
      "📋 JSA/TRA before work — risk analysis before start reduces incident probability by 60%",
      "🦾 Ergonomics — investment in health and long-term personnel productivity",
      "⚡ Electrical safety: insulation test and marking verification — critical before energizing",
      "🌡️ Heat stress management — part of occupational health program (ISO 45001 §8.1)",
      "🔊 Active noise management — step towards reducing occupational hearing diseases",
      "🧪 MSDS/safety data sheet — must always be available when working with chemicals",
      "🚧 Physical and visual barriers — tool for predictable safety culture",
      "📱 Work distraction = violation of golden rules. Focus = saved lives",
      "🤝 Safe buddy system — double control for high-risk work",
      "💨 Gas analysis and confined space ventilation — mandatory permit condition",
      "🏗️ Scaffolding, platforms and towers inspection — part of work permit program",
      "🚛 Minimum safe distance 3m from equipment — ISO/ANSI standard",
      "🔧 Defect-free tools = zero tolerance for safety compromises",
      "📊 Near-miss = free lesson. Analyze and share insights with team",
      "👂 Safety leadership begins with active listening to employees",
      "📢 Behavioral observations (BBS) — identify hidden risks before incidents",
      "🏅 Zero Harm — not a slogan, but a strategy of continuous improvement",
      "🌍 Safety = key element of sustainable development and ESG reporting",
      "💡 Every risk assessment — opportunity to improve safety culture maturity",
      "🤲 Stop work if in doubt. Stop Work Authority — everyone's right",
      "🧭 Leadership safety walks — tool of trust, not control",
      "🧠 Micro-breaks and mindfulness reduce fatigue-related errors",
      "🔄 Incidents repeat where lessons from the past are not learned",
      "📈 Employee safety engagement index = company maturity KPI",
    ],
  };

  const t = translations[language];
  const safetyTips = useMemo(() => safetyTipsData[language], [language]);
  const [currentTip, setCurrentTip] = useState(() => safetyTips[Math.floor(Math.random() * safetyTips.length)]);

  /* ── Timer logic ── */
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          if (minutes === 0) {
            setIsRunning(false);
            playChime();
            setSessionCount(s => s + 1);
            setTodayMinutes(m => m + totalMinutes);
            setStreak(s => s + 1);
            showBrowserNotification(t.sessionDone);
            setToast({ visible: true, message: t.sessionDone });
            setMinutes(totalMinutes);
            setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
            return 0;
          }
          setMinutes(m => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, minutes, totalMinutes, safetyTips, t]);

  /* ── Rotate tips every 30s ── */
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]), 30000);
    return () => clearInterval(id);
  }, [isRunning, safetyTips]);

  /* ── Language change ── */
  useEffect(() => {
    setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
  }, [language, safetyTips]);

  /* ── Audio ── */
  useEffect(() => {
    if (!audioRef.current) return;
    if (ambientSound !== 'none') {
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [ambientSound]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  /* ── Notifications ── */
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const showBrowserNotification = msg => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(msg, { icon: 'images/BP.png' });
    }
  };

  const playChime = () => {
    try { new Audio('End_timer.mp3').play().catch(() => {}); } catch {}
  };

  /* ── Handlers ── */
  const handleStart = () => setIsRunning(r => !r);
  const handleReset = () => { setIsRunning(false); setMinutes(totalMinutes); setSeconds(0); };
  const handlePreset = m => { setTotalMinutes(m); setMinutes(m); setSeconds(0); setIsRunning(false); };
  const handleDial   = m => { if (!isRunning) { setTotalMinutes(m); setMinutes(m); setSeconds(0); } };

  /* ── Progress ── */
  const totalSec     = totalMinutes * 60;
  const remainingSec = minutes * 60 + seconds;
  const progress     = ((totalSec - remainingSec) / totalSec) * 100;
  const circumference = 2 * Math.PI * 130;

  const getBgImage = () => {
    const map = { forest:'images/forest_1.webp', forest2:'images/forest_2.webp', ocean:'images/ocean.webp', construction:'images/construction.webp' };
    return map[ambientSound] || null;
  };

  const audioSrc = { forest:'Forest.mp3', forest2:'Forest_2.mp3', ocean:'Ocean.mp3', construction:'construction_site.mp3' }[ambientSound] || '';

  const soundButtons = [
    { key:'none',         label: t.silence,       icon:'fa-volume-mute', activeColor: '#4B5563' },
    { key:'forest',       label: t.forest,        icon:'fa-tree',         activeColor: '#16a34a' },
    { key:'forest2',      label: t.forest2,       icon:'fa-leaf',         activeColor: '#15803d' },
    { key:'ocean',        label: t.ocean,         icon:'fa-water',        activeColor: '#2563eb' },
    { key:'construction', label: t.construction,  icon:'fa-hammer',       activeColor: BRAND.goldHover },
  ];

  /* ──────────── RENDER ──────────── */
  return (
    <div
      className="min-h-screen p-2 md:p-4 lg:p-8 relative"
      style={{
        backgroundImage: getBgImage()
          ? `linear-gradient(rgba(11,29,58,0.88), rgba(11,29,58,0.88)), url(${getBgImage()})`
          : `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.steel} 55%, ${BRAND.dark} 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <HexBackground />
      <audio ref={audioRef} loop preload="none" src={audioSrc} />
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast(p => ({ ...p, visible: false }))} />

      <div className="max-w-7xl mx-auto relative" style={{ zIndex: 1 }}>

        {/* ── HEADER ── */}
        <header className="text-center mb-4 md:mb-8 slide-in">
          <div
            className="inline-flex items-center gap-3 rounded-2xl px-5 md:px-7 py-3 md:py-4"
            style={{ ...glassStyle, border: `1px solid rgba(212,175,55,0.22)` }}
          >
            <a href="https://bestpracticeai.ru/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <img src="images/BP.png" alt="Best Practice" className="w-10 h-10 md:w-14 md:h-14 object-contain rounded-full" />
            </a>
            <div className="text-left">
              <h1
                className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-none"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Safety Pomodoro
              </h1>
              <p className="text-xs mt-1 font-medium" style={{ color: `rgba(212,175,55,0.65)`, fontFamily: 'Montserrat, sans-serif' }}>
                by Best Practice
              </p>
            </div>
          </div>
          <p
            className="mt-3 text-xs md:text-sm tracking-[0.3em] font-semibold uppercase shimmer-gold"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {t.subtitle}
          </p>
          <p className="hidden md:block mt-1 text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Montserrat, sans-serif' }}>
            {t.tagline}
          </p>
        </header>

        {/* ── LANG SWITCHER ── */}
        <div className="flex justify-center mb-4 md:absolute md:top-4 md:right-4 md:mb-0 z-50">
          <div className="flex gap-1 rounded-full p-1" style={{ ...glassStyle }}>
            {['ru', 'en'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm font-medium"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  background: language === lang ? `rgba(212,175,55,0.2)` : 'transparent',
                  border: language === lang ? `1px solid rgba(212,175,55,0.4)` : '1px solid transparent',
                  color: language === lang ? 'white' : 'rgba(255,255,255,0.55)',
                }}
              >
                <span>{lang === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
                <span>{lang === 'ru' ? 'Rus' : 'Eng'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* TIMER CARD */}
            <FadeIn delay={100} duration={800}>
              <div
                className="rounded-3xl p-6 md:p-8 shadow-2xl slide-in"
                style={{
                  ...glassStyle,
                  ...(isRunning ? { boxShadow: `0 8px 60px rgba(212,175,55,0.18), 0 2px 12px rgba(0,0,0,0.4)` } : {}),
                }}
              >
                <div className="hazard-stripe h-3 rounded-full mb-6 opacity-80"></div>

                {/* TIMER DISPLAY */}
                <div className="text-center mb-6">
                  <div className={`relative inline-block ${isRunning ? 'timer-running' : ''}`}>
                    <PulseRings isRunning={isRunning} />
                    <svg className="progress-ring" width="280" height="280">
                      <defs>
                        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={BRAND.softGold} />
                          <stop offset="100%" stopColor={BRAND.goldHover} />
                        </linearGradient>
                        <filter id="gold-glow">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      {/* Track */}
                      <circle cx="140" cy="140" r="130" stroke={BRAND.steel} strokeWidth="10" fill="none" opacity="0.5" />
                      {/* Progress */}
                      <circle
                        className="progress-ring__circle"
                        cx="140" cy="140" r="130"
                        stroke="url(#prog-grad)"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress / 100)}
                        filter={isRunning ? 'url(#gold-glow)' : undefined}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div
                        className="text-6xl md:text-7xl font-bold text-white tabular-nums"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          textShadow: isRunning ? `0 0 40px rgba(212,175,55,0.35)` : 'none',
                        }}
                      >
                        {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
                      </div>
                      <div
                        className="mt-2 text-xs font-bold tracking-[0.25em] uppercase px-4 py-1 rounded-full"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          background: isRunning ? `rgba(212,175,55,0.12)` : 'rgba(255,255,255,0.06)',
                          border: isRunning ? `1px solid rgba(212,175,55,0.30)` : '1px solid rgba(255,255,255,0.12)',
                          color: isRunning ? BRAND.gold : 'rgba(255,255,255,0.45)',
                        }}
                      >
                        {isRunning ? t.inWork : t.onPause}
                      </div>
                    </div>
                  </div>

                  {/* Session dots */}
                  <SessionDots sessionCount={sessionCount} language={language} />
                </div>

                <GoldDivider />

                {/* CONTROLS */}
                <div className="flex justify-center gap-4 mb-6 mt-4">
                  <GradientBorderButton onClick={handleStart} isActive={isRunning} className="transform hover:scale-105 active:scale-95">
                    <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                    {isRunning ? t.pause : t.start}
                  </GradientBorderButton>
                  <RippleButton
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl font-bold text-lg neo-button transition-all transform hover:scale-105 active:scale-95"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="fas fa-redo mr-2"></i>
                    {t.reset}
                  </RippleButton>
                </div>

                {/* PRESETS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[20, 25, 30, 40].map(preset => (
                    <RippleButton
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className="py-3 rounded-xl font-semibold text-sm transition-all enhanced-button active:scale-95"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        background: totalMinutes === preset
                          ? `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})`
                          : 'rgba(255,255,255,0.07)',
                        color:  totalMinutes === preset ? BRAND.dark : 'rgba(255,255,255,0.75)',
                        border: totalMinutes === preset ? 'none' : '1px solid rgba(255,255,255,0.13)',
                        boxShadow: totalMinutes === preset ? `0 4px 16px rgba(212,175,55,0.35)` : 'none',
                      }}
                    >
                      <i className="fas fa-clock mr-1.5"></i>
                      {preset} {t.minutes}
                    </RippleButton>
                  ))}
                </div>

                {/* DIAL */}
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.60)', fontFamily: 'Montserrat, sans-serif' }}>
                    {t.setTime}:{' '}
                    <span style={{ color: BRAND.gold, fontWeight: 700 }}>{totalMinutes}</span>{' '}
                    {t.minutes}
                  </label>
                  <input
                    type="range" min="1" max="60" value={totalMinutes}
                    onChange={e => handleDial(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${BRAND.gold} 0%, ${BRAND.gold} ${(totalMinutes/60)*100}%, rgba(255,255,255,0.13) ${(totalMinutes/60)*100}%, rgba(255,255,255,0.13) 100%)` }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(255,255,255,0.30)', fontFamily: 'Montserrat, sans-serif' }}>
                    {['1','15','30','45','60'].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* SOUND CARD */}
            <FadeIn delay={300} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: BRAND.gold }}><i className="fas fa-music"></i></span>
                  {t.backgroundSounds}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  {soundButtons.map(({ key, label, icon, activeColor }) => {
                    const isActive = ambientSound === key;
                    return (
                      <RippleButton
                        key={key}
                        onClick={() => setAmbientSound(key)}
                        className="py-3 px-2 rounded-xl text-sm font-medium transition-all enhanced-button active:scale-95"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          background: isActive ? activeColor : 'rgba(255,255,255,0.06)',
                          color: 'white',
                          border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                          boxShadow: isActive ? `0 4px 14px ${activeColor}55` : 'none',
                        }}
                      >
                        <i className={`fas ${icon} mr-1.5`}></i>{label}
                      </RippleButton>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-volume-down text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}></i>
                  <input
                    type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${BRAND.gold} 0%, ${BRAND.gold} ${volume*100}%, rgba(255,255,255,0.13) ${volume*100}%, rgba(255,255,255,0.13) 100%)` }}
                  />
                  <i className="fas fa-volume-up text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}></i>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">

            {/* SAFETY TIP */}
            <FadeIn delay={500} duration={800}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassGoldStyle}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 safety-pulse"
                    style={{ background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})`, boxShadow: `0 0 16px rgba(212,175,55,0.55)` }}
                  >
                    <i className="fas fa-exclamation-triangle text-sm" style={{ color: BRAND.dark }}></i>
                  </div>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t.safetyTip}
                  </h3>
                </div>
                <div
                  className="rounded-xl p-4 mb-4"
                  style={{ background: `rgba(212,175,55,0.06)`, borderLeft: `3px solid rgba(212,175,55,0.55)` }}
                >
                  <p className="text-white/85 text-sm leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                    {currentTip}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)])}
                  className="w-full py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    background: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldHover})`,
                    color: BRAND.dark,
                    boxShadow: `0 4px 16px rgba(212,175,55,0.35)`,
                  }}
                >
                  <i className="fas fa-sync-alt mr-2"></i>{t.newTip}
                </button>
              </div>
            </FadeIn>

            {/* STATS */}
            <FadeIn delay={700} duration={800}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: BRAND.gold }}><i className="fas fa-chart-line"></i></span>
                  {t.dailyStats}
                </h3>
                <div className="space-y-2.5">
                  <StatCard icon="fa-fire"         iconColor={BRAND.gold}    label={t.series}       value={streak}        bg="rgba(212,175,55,0.07)" border="rgba(212,175,55,0.18)" />
                  <StatCard icon="fa-check-circle" iconColor="#4ade80"       label={t.sessions}     value={sessionCount}  bg="rgba(74,222,128,0.06)" border="rgba(74,222,128,0.16)" />
                  <StatCard icon="fa-clock"        iconColor="#60a5fa"       label={t.minutesCount} value={todayMinutes}  bg="rgba(96,165,250,0.06)" border="rgba(96,165,250,0.16)" />
                  <StatCard icon="fa-check-double" iconColor="#c084fc"       label={t.tasks}        value={completedTasks}bg="rgba(192,132,252,0.06)"border="rgba(192,132,252,0.16)" />
                </div>
              </div>
            </FadeIn>

            {/* TASKS */}
            <FadeIn delay={900} duration={800}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: '#818cf8' }}><i className="fas fa-sticky-note"></i></span>
                  {t.dailyTasks}
                </h3>
                <QuickNotes onTaskToggle={setCompletedTasks} translations={t} />
              </div>
            </FadeIn>

            {/* CALENDAR */}
            <FadeIn delay={1100} duration={800}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: '#f472b6' }}><i className="fas fa-calendar-alt"></i></span>
                  {t.calendar}
                </h3>
                <MiniCalendar language={language} />
              </div>
            </FadeIn>

          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="text-center mt-8 pb-2">
          <GoldDivider />
          <a
            href="https://bestpracticeai.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 group transition-all"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            <img src="images/BP.png" alt="BP" className="w-5 h-5 rounded-full opacity-40 group-hover:opacity-70 transition-opacity" />
            <span className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t.madeAt}</span>
            <span
              className="text-xs font-semibold transition-colors group-hover:opacity-100"
              style={{ color: `rgba(212,175,55,0.55)`, fontFamily: 'Montserrat, sans-serif' }}
            >
              Best Practice AI
            </span>
          </a>
        </footer>

      </div>
    </div>
  );
}

/* ── RENDER ── */
const container = document.getElementById('root');
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(container).render(<App />);
} else {
  ReactDOM.render(<App />, container);
}
