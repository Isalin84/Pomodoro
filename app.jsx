const { useState, useEffect, useRef, useMemo, useCallback } = React;

const STORAGE_KEYS = {
  preferences: 'safetyPomodoroPreferencesV2',
  stats: 'safetyPomodoroStatsV2',
  notes: 'pomodoroNotes',
};

const readStored = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' ? value : fallback;
  } catch {
    return fallback;
  }
};

const dateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getAutomaticSeason = () => {
  const month = new Date().getMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
};

const SEASON_THEMES = {
  summer: {
    icon: '☀️',
    image: 'images/season-summer.webp',
    accent: '#9BCB78',
    soft: '#D9E8A8',
    overlay: 'rgba(7, 28, 42, 0.78)',
    overlayDeep: 'rgba(5, 20, 36, 0.92)',
  },
  autumn: {
    icon: '🍂',
    image: 'images/season-autumn.webp',
    accent: '#D4AF37',
    soft: '#E8C985',
    overlay: 'rgba(28, 24, 32, 0.78)',
    overlayDeep: 'rgba(11, 24, 45, 0.93)',
  },
  winter: {
    icon: '❄️',
    image: 'images/season-winter.webp',
    accent: '#9FD8F2',
    soft: '#D9F2FF',
    overlay: 'rgba(8, 30, 56, 0.72)',
    overlayDeep: 'rgba(4, 19, 40, 0.91)',
  },
  spring: {
    icon: '🌱',
    image: 'images/season-spring.webp',
    accent: '#A9D6A2',
    soft: '#E2C4DA',
    overlay: 'rgba(7, 35, 43, 0.76)',
    overlayDeep: 'rgba(5, 23, 39, 0.92)',
  },
};

const PROCEDURAL_SOUNDS = new Set(['brown', 'rain', 'zen']);

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
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [visible, setVisible] = useState(reduceMotion);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, reduceMotion]);
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
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '80px'})`,
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl cursor-pointer"
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="ml-2 rounded p-1 text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <i className="fas fa-times text-xs" aria-hidden="true"></i>
        </button>
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
function QuickNotes({ onTaskToggle, translations, clearSignal }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || '[]'); }
    catch { return []; }
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    onTaskToggle(notes.filter(n => n.completed).length);
  }, [notes, onTaskToggle]);

  useEffect(() => {
    if (clearSignal > 0) setNotes([]);
  }, [clearSignal]);

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
          type="button"
          onClick={addNote}
          aria-label={translations.addTaskAction}
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
              aria-label={`${translations.markTask}: ${note.text}`}
              className="w-4 h-4 cursor-pointer flex-shrink-0"
              style={{ accentColor: BRAND.gold }}
            />
            <span className={`flex-1 text-sm transition-all ${note.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
              {note.text}
            </span>
            <button
              type="button"
              onClick={() => deleteNote(note.id)}
              aria-label={`${translations.deleteTask}: ${note.text}`}
              className="rounded p-2 text-red-300/70 transition-colors hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200/70"
            >
              <i className="fas fa-trash" aria-hidden="true"></i>
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
  const savedPreferences = useMemo(() => readStored(STORAGE_KEYS.preferences, {}), []);
  const savedStats = useMemo(() => {
    const stored = readStored(STORAGE_KEYS.stats, {});
    if (stored.date === dateKey()) return stored;
    return {
      ...stored,
      date: dateKey(),
      sessionCount: 0,
      todayMinutes: 0,
      meditationSessions: 0,
      meditationMinutes: 0,
    };
  }, []);

  const initialMode = savedPreferences.mode === 'meditation' ? 'meditation' : 'focus';
  const initialFocusDuration = Number(savedPreferences.focusDuration) || 25;
  const initialMeditationDuration = Number(savedPreferences.meditationDuration) || 10;
  const initialDuration = initialMode === 'meditation' ? initialMeditationDuration : initialFocusDuration;

  const [mode,          setMode]         = useState(initialMode);
  const [focusDuration, setFocusDuration]= useState(initialFocusDuration);
  const [meditationDuration, setMeditationDuration] = useState(initialMeditationDuration);
  const [minutes,       setMinutes]      = useState(initialDuration);
  const [seconds,       setSeconds]      = useState(0);
  const [totalMinutes,  setTotalMinutes] = useState(initialDuration);
  const [isRunning,     setIsRunning]    = useState(false);
  const [sessionCount,  setSessionCount] = useState(Number(savedStats.sessionCount) || 0);
  const [meditationSessions, setMeditationSessions] = useState(Number(savedStats.meditationSessions) || 0);
  const [meditationMinutes, setMeditationMinutes] = useState(Number(savedStats.meditationMinutes) || 0);
  const [ambientSound,  setAmbientSound] = useState(savedPreferences.ambientSound || 'none');
  const [volume,        setVolume]       = useState(Number.isFinite(savedPreferences.volume) ? savedPreferences.volume : 0.5);
  const [language,      setLanguage]     = useState(savedPreferences.language === 'en' ? 'en' : 'ru');
  const [todayMinutes,  setTodayMinutes] = useState(Number(savedStats.todayMinutes) || 0);
  const [streak,        setStreak]       = useState(Number(savedStats.streak) || 0);
  const [completedTasks,setCompletedTasks]= useState(0);
  const [seasonPreference, setSeasonPreference] = useState(
    ['auto', 'summer', 'autumn', 'winter', 'spring'].includes(savedPreferences.seasonPreference)
      ? savedPreferences.seasonPreference
      : 'auto'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(Boolean(savedPreferences.notificationsEnabled));
  const [clearSignal, setClearSignal] = useState(0);
  const [toast,         setToast]        = useState({ visible: false, message: '' });
  const audioRef = useRef(null);
  const proceduralAudioRef = useRef(null);
  const deadlineRef = useRef(null);

  const activeSeason = seasonPreference === 'auto' ? getAutomaticSeason() : seasonPreference;
  const seasonTheme = SEASON_THEMES[activeSeason];

  /* ── Translations ── */
  const translations = {
    ru: {
      title:'Safety Pomodoro', subtitle:'ПРОДУКТИВНАЯ БЕЗОПАСНОСТЬ',
      tagline:'Экспертиза × ИИ × Результат',
      onPause:'На паузе', inWork:'В работе',
      start:'Старт', pause:'Пауза', reset:'Сброс',
      focus:'Фокус', meditation:'Медитация',
      focusHint:'Рабочая сессия', meditationHint:'Спокойное дыхание и восстановление',
      minutes:'мин', setTime:'Установить время',
      backgroundSounds:'Фоновые звуки',
      silence:'Тишина', forest:'Лес', forest2:'Лес 2', ocean:'Океан', construction:'Стройка',
      brown:'Brown noise', rain:'Мягкий дождь', zen:'Тихий drone',
      safetyTip:'Совет по безопасности', newTip:'Новый совет',
      dailyStats:'Статистика дня', series:'Серия', sessions:'Сессий',
      minutesCount:'Минут', meditationCount:'Медитаций', tasks:'Задач',
      dailyTasks:'Задачи на день', addTask:'Добавить задачу...', addTaskAction:'Добавить задачу',
      markTask:'Отметить задачу', deleteTask:'Удалить задачу',
      completed:'Завершено', madeAt:'Создано с',
      sessionDone:'🎉 Сессия завершена! Время для перерыва',
      meditationDone:'Медитация завершена. Возвращайтесь к делам без спешки',
      atmosphere:'Атмосфера',
      season:'Сезон', auto:'Авто', summer:'Лето', autumn:'Осень', winter:'Зима', spring:'Весна',
      settings:'Настройки и данные',
      notifications:'Уведомления', notificationsOn:'Включены', notificationsOff:'Выключены',
      notificationsDenied:'Браузер заблокировал уведомления. Разрешите их в настройках сайта.',
      clearData:'Очистить данные',
      clearConfirm:'Удалить сохранённые задачи, статистику и настройки Safety Pomodoro?',
      dataCleared:'Сохранённые данные очищены',
      volume:'Громкость',
    },
    en: {
      title:'Safety Pomodoro', subtitle:'PRODUCTIVE SAFETY',
      tagline:'Expertise × AI × Results',
      onPause:'On pause', inWork:'In work',
      start:'Start', pause:'Pause', reset:'Reset',
      focus:'Focus', meditation:'Meditation',
      focusHint:'Work session', meditationHint:'Calm breathing and recovery',
      minutes:'min', setTime:'Set time',
      backgroundSounds:'Background sounds',
      silence:'Silence', forest:'Forest', forest2:'Forest 2', ocean:'Ocean', construction:'Construction',
      brown:'Brown noise', rain:'Gentle rain', zen:'Quiet drone',
      safetyTip:'Safety tip', newTip:'New tip',
      dailyStats:'Daily statistics', series:'Series', sessions:'Sessions',
      minutesCount:'Minutes', meditationCount:'Meditations', tasks:'Tasks',
      dailyTasks:'Daily tasks', addTask:'Add task...', addTaskAction:'Add task',
      markTask:'Mark task', deleteTask:'Delete task',
      completed:'Completed', madeAt:'Made with',
      sessionDone:'🎉 Session complete! Time for a break',
      meditationDone:'Meditation complete. Return to your work without rushing',
      atmosphere:'Atmosphere',
      season:'Season', auto:'Auto', summer:'Summer', autumn:'Autumn', winter:'Winter', spring:'Spring',
      settings:'Settings and data',
      notifications:'Notifications', notificationsOn:'On', notificationsOff:'Off',
      notificationsDenied:'The browser blocked notifications. Allow them in site settings.',
      clearData:'Clear saved data',
      clearConfirm:'Delete saved tasks, statistics and Safety Pomodoro settings?',
      dataCleared:'Saved data cleared',
      volume:'Volume',
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

  /* ── Persistence ── */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify({
      mode,
      focusDuration,
      meditationDuration,
      ambientSound,
      volume,
      language,
      seasonPreference,
      notificationsEnabled,
    }));
  }, [
    mode,
    focusDuration,
    meditationDuration,
    ambientSound,
    volume,
    language,
    seasonPreference,
    notificationsEnabled,
  ]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify({
      date: dateKey(),
      sessionCount,
      todayMinutes,
      meditationSessions,
      meditationMinutes,
      streak,
    }));
  }, [sessionCount, todayMinutes, meditationSessions, meditationMinutes, streak]);

  /* ── Timer logic ── */
  const completeSession = useCallback(() => {
    setIsRunning(false);
    deadlineRef.current = null;
    playChime();

    if (mode === 'meditation') {
      setMeditationSessions(value => value + 1);
      setMeditationMinutes(value => value + totalMinutes);
    } else {
      setSessionCount(value => value + 1);
      setTodayMinutes(value => value + totalMinutes);
      setStreak(value => value + 1);
    }

    const activeTranslations = translations[language];
    const message = mode === 'meditation' ? activeTranslations.meditationDone : activeTranslations.sessionDone;
    showBrowserNotification(message);
    setToast({ visible: true, message });
    setMinutes(totalMinutes);
    setSeconds(0);
    setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
  }, [mode, safetyTips, language, totalMinutes, notificationsEnabled]);

  useEffect(() => {
    if (!isRunning) return;

    if (!deadlineRef.current) {
      deadlineRef.current = Date.now() + (minutes * 60 + seconds) * 1000;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      if (remaining <= 0) {
        completeSession();
        return;
      }
      setMinutes(Math.floor(remaining / 60));
      setSeconds(remaining % 60);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 250);
    return () => clearInterval(interval);
  }, [isRunning, completeSession]);

  useEffect(() => {
    const handleVisibility = () => {
      if (isRunning && !document.hidden && deadlineRef.current) {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setMinutes(Math.floor(remaining / 60));
        setSeconds(remaining % 60);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

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
  const stopProceduralSound = () => {
    const current = proceduralAudioRef.current;
    if (!current) return;
    current.nodes.forEach(node => {
      try { node.stop?.(); } catch {}
      try { node.disconnect?.(); } catch {}
    });
    try { current.context.close(); } catch {}
    proceduralAudioRef.current = null;
  };

  const startProceduralSound = type => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    stopProceduralSound();
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = volume * 0.32;
    master.connect(context.destination);
    const nodes = [];

    if (type === 'zen') {
      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index === 1 ? 'triangle' : 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.value = [0.12, 0.05, 0.025][index];
        oscillator.connect(gain).connect(master);
        oscillator.start();
        nodes.push(oscillator, gain);
      });
      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 0.035;
      lfo.connect(lfoGain).connect(master.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);
    } else {
      const frameCount = context.sampleRate * 4;
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < frameCount; i += 1) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown') {
          last = (last + 0.02 * white) / 1.02;
          data[i] = last * 3.2;
        } else {
          data[i] = white * (0.55 + Math.random() * 0.35);
        }
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      source.buffer = buffer;
      source.loop = true;
      filter.type = type === 'brown' ? 'lowpass' : 'bandpass';
      filter.frequency.value = type === 'brown' ? 700 : 1800;
      filter.Q.value = type === 'brown' ? 0.5 : 0.7;
      source.connect(filter).connect(master);
      source.start();
      nodes.push(source, filter);
    }

    proceduralAudioRef.current = { context, master, nodes };
    context.resume().catch(() => {});
  };

  useEffect(() => {
    if (!audioRef.current) return undefined;
    audioRef.current.pause();
    stopProceduralSound();

    if (PROCEDURAL_SOUNDS.has(ambientSound)) {
      startProceduralSound(ambientSound);
    } else if (ambientSound !== 'none') {
      audioRef.current.load();
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }

    return () => stopProceduralSound();
  }, [ambientSound]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    const procedural = proceduralAudioRef.current;
    if (procedural) {
      procedural.master.gain.setTargetAtTime(volume * 0.32, procedural.context.currentTime, 0.08);
    }
  }, [volume]);

  /* ── Notifications ── */
  const showBrowserNotification = msg => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(msg, { icon: 'images/LogoBP_YellowCircle.png' });
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
      setToast({ visible: true, message: t.notificationsDenied });
    }
  };

  const playChime = () => {
    try { new Audio('End_timer.mp3').play().catch(() => {}); } catch {}
  };

  /* ── Handlers ── */
  const handleStart = () => {
    if (isRunning) {
      setIsRunning(false);
      deadlineRef.current = null;
      return;
    }
    deadlineRef.current = Date.now() + (minutes * 60 + seconds) * 1000;
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    deadlineRef.current = null;
    setMinutes(totalMinutes);
    setSeconds(0);
  };

  const updateModeDuration = value => {
    if (mode === 'meditation') setMeditationDuration(value);
    else setFocusDuration(value);
  };

  const handlePreset = value => {
    updateModeDuration(value);
    setTotalMinutes(value);
    setMinutes(value);
    setSeconds(0);
    deadlineRef.current = null;
    setIsRunning(false);
  };

  const handleDial = value => {
    if (!isRunning) handlePreset(value);
  };

  const handleModeChange = nextMode => {
    if (nextMode === mode) return;
    const nextDuration = nextMode === 'meditation' ? meditationDuration : focusDuration;
    setMode(nextMode);
    setTotalMinutes(nextDuration);
    setMinutes(nextDuration);
    setSeconds(0);
    deadlineRef.current = null;
    setIsRunning(false);
  };

  const clearSavedData = () => {
    if (!window.confirm(t.clearConfirm)) return;
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    stopProceduralSound();
    audioRef.current?.pause();
    setMode('focus');
    setFocusDuration(25);
    setMeditationDuration(10);
    setTotalMinutes(25);
    setMinutes(25);
    setSeconds(0);
    setIsRunning(false);
    setSessionCount(0);
    setMeditationSessions(0);
    setMeditationMinutes(0);
    setTodayMinutes(0);
    setStreak(0);
    setCompletedTasks(0);
    setAmbientSound('none');
    setVolume(0.5);
    setLanguage('ru');
    setSeasonPreference('auto');
    setNotificationsEnabled(false);
    setClearSignal(value => value + 1);
    setToast({ visible: true, message: t.dataCleared });
  };

  /* ── Progress ── */
  const totalSec     = totalMinutes * 60;
  const remainingSec = minutes * 60 + seconds;
  const progress     = ((totalSec - remainingSec) / totalSec) * 100;
  const circumference = 2 * Math.PI * 130;

  const audioSrc = { forest:'Forest.mp3', forest2:'Forest_2.mp3', ocean:'Ocean.mp3', construction:'construction_site.mp3' }[ambientSound] || '';

  const soundButtons = [
    { key:'none',         label: t.silence,       icon:'fa-volume-mute', activeColor: '#4B5563' },
    { key:'forest',       label: t.forest,        icon:'fa-tree',         activeColor: '#16a34a' },
    { key:'forest2',      label: t.forest2,       icon:'fa-leaf',         activeColor: '#15803d' },
    { key:'ocean',        label: t.ocean,         icon:'fa-water',        activeColor: '#2563eb' },
    { key:'construction', label: t.construction,  icon:'fa-hammer',       activeColor: BRAND.goldHover },
    { key:'brown',        label: t.brown,         icon:'fa-wave-square',  activeColor: '#7c6f64' },
    { key:'rain',         label: t.rain,          icon:'fa-cloud-rain',   activeColor: '#3b82a0' },
    { key:'zen',          label: t.zen,           icon:'fa-spa',          activeColor: '#8b78b8' },
  ];

  const presets = mode === 'meditation' ? [5, 10, 15, 20] : [20, 25, 30, 40];
  const seasonOptions = ['auto', 'summer', 'autumn', 'winter', 'spring'];

  /* ──────────── RENDER ──────────── */
  return (
    <div
      className="min-h-screen p-2 md:p-4 lg:p-8 relative"
      style={{
        '--season-accent': seasonTheme.accent,
        '--season-soft': seasonTheme.soft,
        backgroundImage: `linear-gradient(180deg, ${seasonTheme.overlay} 0%, ${seasonTheme.overlayDeep} 72%, ${BRAND.dark} 100%), url(${seasonTheme.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
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
            style={{ ...glassStyle, border: `1px solid ${seasonTheme.accent}55` }}
          >
            <a href="https://bestpracticeai.ru/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity flex-shrink-0">
              <img src="images/LogoBP_YellowCircle.png" alt="Best Practice" className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full" />
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
                type="button"
                key={lang}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all text-sm font-medium"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  background: language === lang ? `${seasonTheme.accent}33` : 'transparent',
                  border: language === lang ? `1px solid ${seasonTheme.accent}66` : '1px solid transparent',
                  color: language === lang ? 'white' : 'rgba(255,255,255,0.55)',
                }}
              >
                <span>{lang === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
                <span>{lang === 'ru' ? 'Rus' : 'Eng'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── MODE + SEASON ── */}
        <div className="mb-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <div className="flex rounded-2xl p-1" style={glassStyle} aria-label={t.focus}>
            {[
              { key: 'focus', icon: 'fa-bullseye', label: t.focus },
              { key: 'meditation', icon: 'fa-spa', label: t.meditation },
            ].map(option => (
              <button
                type="button"
                key={option.key}
                onClick={() => handleModeChange(option.key)}
                aria-pressed={mode === option.key}
                className="rounded-xl px-4 py-2.5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  color: mode === option.key ? BRAND.dark : 'rgba(255,255,255,0.70)',
                  background: mode === option.key
                    ? `linear-gradient(135deg, ${seasonTheme.soft}, ${seasonTheme.accent})`
                    : 'transparent',
                }}
              >
                <i className={`fas ${option.icon} mr-2`} aria-hidden="true"></i>
                {option.label}
              </button>
            ))}
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80"
            style={{ ...glassStyle, border: `1px solid ${seasonTheme.accent}45`, fontFamily: 'Montserrat, sans-serif' }}
          >
            <span aria-hidden="true">{seasonTheme.icon}</span>
            <span>{t[activeSeason]}</span>
            {seasonPreference === 'auto' && <span className="text-white/45">· {t.auto}</span>}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* TIMER CARD */}
            <FadeIn delay={100} duration={800}>
              <div
                className="rounded-3xl p-4 md:p-8 shadow-2xl slide-in"
                style={{
                  ...glassStyle,
                  border: `1px solid ${seasonTheme.accent}33`,
                  ...(isRunning ? { boxShadow: `0 8px 60px ${seasonTheme.accent}2d, 0 2px 12px rgba(0,0,0,0.4)` } : {}),
                }}
              >
                <div className="hazard-stripe h-2.5 rounded-full mb-4 md:mb-6 opacity-80"></div>

                {/* TIMER DISPLAY */}
                <div className="text-center mb-4 md:mb-6">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                    {mode === 'meditation' ? t.meditationHint : t.focusHint}
                  </p>
                  <div className={`relative inline-block ${isRunning ? 'timer-running' : ''}`}>
                    <PulseRings isRunning={isRunning} />
                    <svg className="progress-ring h-auto w-[230px] md:w-[280px]" viewBox="0 0 280 280" role="img" aria-label={`${minutes}:${String(seconds).padStart(2, '0')}`}>
                      <defs>
                        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={seasonTheme.soft} />
                          <stop offset="100%" stopColor={seasonTheme.accent} />
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
                        className="text-5xl md:text-7xl font-bold text-white tabular-nums"
                        role="timer"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          textShadow: isRunning ? `0 0 40px ${seasonTheme.accent}55` : 'none',
                        }}
                      >
                        {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
                      </div>
                      <div
                        className="mt-2 text-xs font-bold tracking-[0.25em] uppercase px-4 py-1 rounded-full"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          background: isRunning ? `${seasonTheme.accent}20` : 'rgba(255,255,255,0.06)',
                          border: isRunning ? `1px solid ${seasonTheme.accent}55` : '1px solid rgba(255,255,255,0.12)',
                          color: isRunning ? seasonTheme.soft : 'rgba(255,255,255,0.60)',
                        }}
                      >
                        {isRunning ? t.inWork : t.onPause}
                      </div>
                    </div>
                  </div>

                  {/* Session dots */}
                  {mode === 'focus' && <SessionDots sessionCount={sessionCount} language={language} />}
                </div>

                <GoldDivider />

                {/* CONTROLS */}
                <div className="flex justify-center gap-4 mb-6 mt-4">
                  <GradientBorderButton onClick={handleStart} isActive={isRunning} className="transform hover:scale-105 active:scale-95">
                    <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`} aria-hidden="true"></i>
                    {isRunning ? t.pause : t.start}
                  </GradientBorderButton>
                  <RippleButton
                    onClick={handleReset}
                    className="px-5 md:px-8 py-4 rounded-2xl font-bold text-lg neo-button transition-all transform hover:scale-105 active:scale-95"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="fas fa-redo mr-2" aria-hidden="true"></i>
                    {t.reset}
                  </RippleButton>
                </div>

                {/* PRESETS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {presets.map(preset => (
                    <RippleButton
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className="py-3 rounded-xl font-semibold text-sm transition-all enhanced-button active:scale-95"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        background: totalMinutes === preset
                          ? `linear-gradient(135deg, ${seasonTheme.soft}, ${seasonTheme.accent})`
                          : 'rgba(255,255,255,0.07)',
                        color:  totalMinutes === preset ? BRAND.dark : 'rgba(255,255,255,0.75)',
                        border: totalMinutes === preset ? 'none' : '1px solid rgba(255,255,255,0.13)',
                        boxShadow: totalMinutes === preset ? `0 4px 16px ${seasonTheme.accent}55` : 'none',
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
                    aria-label={`${t.setTime}: ${totalMinutes} ${t.minutes}`}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${seasonTheme.accent} 0%, ${seasonTheme.accent} ${(totalMinutes/60)*100}%, rgba(255,255,255,0.13) ${(totalMinutes/60)*100}%, rgba(255,255,255,0.13) 100%)` }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(255,255,255,0.30)', fontFamily: 'Montserrat, sans-serif' }}>
                    {['1','15','30','45','60'].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* TASKS — kept close to the timer on every screen */}
            <FadeIn delay={220} duration={700}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassStyle}>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: '#a5b4fc' }}><i className="fas fa-sticky-note" aria-hidden="true"></i></span>
                  {t.dailyTasks}
                </h2>
                <QuickNotes
                  onTaskToggle={setCompletedTasks}
                  translations={t}
                  clearSignal={clearSignal}
                />
              </div>
            </FadeIn>

            {/* SOUND CARD */}
            <FadeIn delay={300} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: BRAND.gold }}><i className="fas fa-music"></i></span>
                  {t.backgroundSounds}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {soundButtons.map(({ key, label, icon, activeColor }) => {
                    const isActive = ambientSound === key;
                    return (
                      <RippleButton
                        key={key}
                        onClick={() => setAmbientSound(key)}
                        aria-pressed={isActive}
                        className="py-3 px-2 rounded-xl text-sm font-medium transition-all enhanced-button active:scale-95"
                        style={{
                          fontFamily: 'Montserrat, sans-serif',
                          background: isActive ? activeColor : 'rgba(255,255,255,0.06)',
                          color: 'white',
                          border: isActive ? 'none' : '1px solid rgba(255,255,255,0.12)',
                          boxShadow: isActive ? `0 4px 14px ${activeColor}55` : 'none',
                        }}
                      >
                        <i className={`fas ${icon} mr-1.5`} aria-hidden="true"></i>{label}
                      </RippleButton>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-volume-down text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}></i>
                  <input
                    type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    aria-label={`${t.volume}: ${Math.round(volume * 100)}%`}
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
                  <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t.safetyTip}
                  </h2>
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
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: BRAND.gold }}><i className="fas fa-chart-line"></i></span>
                  {t.dailyStats}
                </h2>
                <div className="space-y-2.5">
                  <StatCard icon="fa-fire"         iconColor={BRAND.gold}    label={t.series}       value={streak}        bg="rgba(212,175,55,0.07)" border="rgba(212,175,55,0.18)" />
                  <StatCard icon="fa-check-circle" iconColor="#4ade80"       label={t.sessions}     value={sessionCount}  bg="rgba(74,222,128,0.06)" border="rgba(74,222,128,0.16)" />
                  <StatCard icon="fa-clock"        iconColor="#60a5fa"       label={t.minutesCount} value={todayMinutes}  bg="rgba(96,165,250,0.06)" border="rgba(96,165,250,0.16)" />
                  <StatCard icon="fa-spa"          iconColor="#c4b5fd"       label={t.meditationCount} value={meditationSessions} bg="rgba(196,181,253,0.06)" border="rgba(196,181,253,0.16)" />
                  <StatCard icon="fa-check-double" iconColor="#c084fc"       label={t.tasks}        value={completedTasks}bg="rgba(192,132,252,0.06)"border="rgba(192,132,252,0.16)" />
                </div>
              </div>
            </FadeIn>

            {/* SETTINGS + DATA */}
            <FadeIn delay={900} duration={800}>
              <div className="rounded-2xl p-5 shadow-xl slide-in" style={glassStyle}>
                <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span style={{ color: seasonTheme.accent }}><i className="fas fa-sliders-h" aria-hidden="true"></i></span>
                  {t.settings}
                </h2>

                <fieldset className="mb-4">
                  <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/65">{t.season}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {seasonOptions.map(season => {
                      const selected = seasonPreference === season;
                      const previewSeason = season === 'auto' ? getAutomaticSeason() : season;
                      return (
                        <button
                          type="button"
                          key={season}
                          onClick={() => setSeasonPreference(season)}
                          aria-pressed={selected}
                          className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          style={{
                            color: selected ? BRAND.dark : 'rgba(255,255,255,0.75)',
                            background: selected
                              ? `linear-gradient(135deg, ${SEASON_THEMES[previewSeason].soft}, ${SEASON_THEMES[previewSeason].accent})`
                              : 'rgba(255,255,255,0.06)',
                            border: selected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          <span className="mr-2" aria-hidden="true">
                            {season === 'auto' ? '◉' : SEASON_THEMES[season].icon}
                          </span>
                          {t[season]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <button
                  type="button"
                  onClick={toggleNotifications}
                  className="mb-3 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  <span><i className="fas fa-bell mr-2 text-sky-300" aria-hidden="true"></i>{t.notifications}</span>
                  <span style={{ color: notificationsEnabled ? '#86efac' : 'rgba(255,255,255,0.50)' }}>
                    {notificationsEnabled ? t.notificationsOn : t.notificationsOff}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={clearSavedData}
                  className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold text-red-100 transition-colors hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200/70"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.24)' }}
                >
                  <i className="fas fa-trash-alt mr-2" aria-hidden="true"></i>{t.clearData}
                </button>
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
            <img src="images/LogoBP_YellowCircle.png" alt="Best Practice" className="w-6 h-6 rounded-full opacity-60 group-hover:opacity-90 transition-opacity" />
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
