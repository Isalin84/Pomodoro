const { useState, useEffect, useRef, useMemo } = React;

// =====================
// BEST PRACTICE BRAND COLORS
// =====================
const BP = {
  gold:       '#D4A017',
  goldLight:  '#E8C04A',
  goldDark:   '#A07810',
  navy:       '#0f1c2e',
  navyLight:  '#1b2b45',
  navyMid:    '#243656',
  steel:      '#2d4a6e',
  text:       '#f0f4f8',
  textMuted:  '#94a3b8',
};

// =====================
// CALENDAR COMPONENT
// =====================
const MiniCalendar = ({ language }) => {
  const [currentDate] = useState(new Date());

  const { daysInMonth, startingDayOfWeek, year, month } = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    return {
      daysInMonth: new Date(y, m + 1, 0).getDate(),
      startingDayOfWeek: new Date(y, m, 1).getDay(),
      year: y,
      month: m,
    };
  }, [currentDate]);

  const today = currentDate.getDate();

  const monthNames = {
    ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  };
  const dayNames = {
    ru: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
    en: ['Su','Mo','Tu','We','Th','Fr','Sa'],
  };

  const cells = [];
  for (let i = 0; i < startingDayOfWeek; i++) cells.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today;
    cells.push(
      <div
        key={d}
        className={`h-8 flex items-center justify-center text-sm rounded-lg transition-all cursor-default ${
          isToday ? 'cal-today animate-pulse font-bold shadow-lg' : 'text-gray-300 cal-day'
        }`}
        style={isToday ? { color: BP.navy, background: `linear-gradient(135deg, ${BP.gold}, ${BP.goldLight})` } : {}}
      >
        {d}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="text-center mb-3">
        <span className="text-base font-bold" style={{ color: BP.goldLight }}>
          {monthNames[language][month]} {year}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames[language].map((d, i) => (
          <div key={i} className="h-7 flex items-center justify-center text-xs font-semibold" style={{ color: BP.textMuted }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  );
};

// =====================
// TOOLTIP
// =====================
const Tooltip = ({ children, text }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative w-full" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-2 text-xs text-white rounded-lg shadow-xl whitespace-nowrap animate-fadeIn pointer-events-none"
          style={{ background: BP.navyMid, border: `1px solid ${BP.goldDark}` }}>
          {text}
          <div className="absolute w-2 h-2 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"
            style={{ background: BP.navyMid }} />
        </div>
      )}
    </div>
  );
};

// =====================
// RIPPLE BUTTON
// =====================
const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
      setTimeout(() => setIsRippling(false), 600);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => { if (!isRippling) setCoords({ x: -1, y: -1 }); }, [isRippling]);

  return (
    <button
      className={`ripple-button relative overflow-hidden ${className}`}
      onClick={e => {
        const rect = e.target.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onClick && onClick(e);
      }}
      {...props}
    >
      {isRippling && (
        <span className="ripple absolute w-5 h-5 bg-white/20 rounded-full pointer-events-none"
          style={{ left: coords.x - 10, top: coords.y - 10, animation: 'ripple-effect 0.6s ease-out forwards' }} />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// =====================
// GRADIENT BORDER BUTTON (gold on dark)
// =====================
const GradientBorderButton = ({ children, onClick, isActive = false, className = '', ...props }) => (
  <button
    className={`gradient-border-btn relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-none p-[2px] ${className}`}
    onClick={onClick}
    {...props}
  >
    <span className={`gradient-border-span relative z-[1] w-full rounded-2xl px-8 py-4 text-lg font-semibold backdrop-blur-md transition-all ${
      isActive
        ? 'text-white shadow-lg'
        : 'text-white shadow'
    }`}
      style={isActive
        ? { background: `linear-gradient(135deg, ${BP.gold}, ${BP.goldLight})`, color: BP.navy }
        : { background: BP.navyMid }
      }
    >
      {children}
    </span>
  </button>
);

// =====================
// FADE-IN WRAPPER
// =====================
const FadeIn = ({ children, delay = 0, duration = 500, className = '' }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`transition-all ease-out ${className}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transitionDuration: `${duration}ms` }}>
      {children}
    </div>
  );
};

// =====================
// GLASS CARD
// =====================
const GlassCard = ({ children, className = '', style = {} }) => (
  <div className={`glass rounded-2xl shadow-xl glass-hover ${className}`} style={style}>
    {children}
  </div>
);

// =====================
// SECTION HEADER
// =====================
const SectionHeader = ({ icon, iconColor, children }) => (
  <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: BP.text }}>
    <i className={`${icon}`} style={{ color: iconColor || BP.gold }}></i>
    {children}
  </h3>
);

// =====================
// MAIN APP
// =====================
function App() {
  const [minutes, setMinutes]           = useState(25);
  const [seconds, setSeconds]           = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [isRunning, setIsRunning]       = useState(false);

  const [ambientSound, setAmbientSound] = useState('none');
  const [volume, setVolume]             = useState(0.5);
  const audioRef                        = useRef(null);

  const [language, setLanguage]         = useState('ru');

  const translations = {
    ru: {
      title: 'Safety Pomodoro', subtitle: 'ПРОДУКТИВНАЯ БЕЗОПАСНОСТЬ',
      onPause: 'На паузе', inWork: 'В работе',
      start: 'Старт', pause: 'Пауза', reset: 'Сброс', minutes: 'мин',
      setTime: 'Установить время',
      backgroundSounds: 'Фоновые звуки',
      silence: 'Тишина', forest: 'Лес', forest2: 'Лес 2', ocean: 'Океан', construction: 'Стройка',
      safetyTip: 'Совет по безопасности', newTip: 'Новый совет',
      dailyStats: 'Статистика дня', series: 'Серия', sessions: 'Сессий', minutesCount: 'Минут', tasks: 'Задач',
      dailyTasks: 'Задачи на день', addTask: 'Добавить задачу...',
      completed: 'Завершено', clearCompleted: 'Очистить выполненные',
      calendar: 'Календарь', today: 'Сегодня',
      taskArchive: 'Архив задач', completedOn: 'Завершено',
      noArchivedTasks: 'Нет архивных задач', clearArchive: 'Очистить архив',
      madeBy: 'Сделано в',
    },
    en: {
      title: 'Safety Pomodoro', subtitle: 'PRODUCTIVE SAFETY',
      onPause: 'On pause', inWork: 'In work',
      start: 'Start', pause: 'Pause', reset: 'Reset', minutes: 'min',
      setTime: 'Set time',
      backgroundSounds: 'Background sounds',
      silence: 'Silence', forest: 'Forest', forest2: 'Forest 2', ocean: 'Ocean', construction: 'Construction',
      safetyTip: 'Safety tip', newTip: 'New tip',
      dailyStats: 'Daily stats', series: 'Streak', sessions: 'Sessions', minutesCount: 'Minutes', tasks: 'Tasks',
      dailyTasks: 'Daily tasks', addTask: 'Add task...',
      completed: 'Completed', clearCompleted: 'Clear completed',
      calendar: 'Calendar', today: 'Today',
      taskArchive: 'Task archive', completedOn: 'Completed on',
      noArchivedTasks: 'No archived tasks', clearArchive: 'Clear archive',
      madeBy: 'Made at',
    },
  };

  const safetyTipsTranslations = {
    ru: [
      '🦺 Проверка и правильное использование СИЗ — ключевой элемент культуры личной ответственности',
      '⚠️ Правило трёх точек опоры при работе на высоте — стандарт мирового уровня (ANSI Z359)',
      '🔒 LOTO: блокировка и маркировка — предотвращают 80% инцидентов с оборудованием',
      '👀 5S и визуальное управление — фундамент безопасной производственной среды',
      '🚨 Тренируйтесь в эвакуации: знание маршрутов важно, но практика решает всё',
      '🧯 Проверка огнетушителей — часть ежедневного safety walk',
      '📋 JSA/TRA перед работой — анализ рисков до старта снижает вероятность инцидента на 60%',
      '🦾 Эргономика — инвестиция в здоровье и долгосрочную продуктивность персонала',
      '⚡ Электробезопасность: тест изоляции и проверка маркировки — критично перед включением',
      '🌡️ Управление тепловым стрессом — часть программы охраны здоровья (ISO 45001 §8.1)',
      '🔊 Активное управление шумом — шаг к снижению профзаболеваний слуха',
      '🧪 MSDS/паспорт безопасности — всегда должен быть доступен при работе с химикатами',
      '🚧 Физические и визуальные барьеры — инструмент культуры предсказуемой безопасности',
      '📱 Отвлечение от работы = нарушение golden rules. Фокус = сохранённые жизни',
      '🤝 Safe buddy system — двойной контроль при high-risk работах',
      '💨 Газоанализ и вентиляция замкнутых пространств — обязательное условие допуска',
      '🏗️ Инспекция лесов, подмостей и вышек — часть программы разрешений на работу',
      '🚛 Минимальная безопасная дистанция 3 м от техники — стандарт ISO/ANSI',
      '🔧 Инструмент без дефектов = нулевая толерантность к компромиссам по безопасности',
      '📊 Near-miss = бесплатный урок. Анализируйте и делитесь выводами в команде',
      '👂 Лидерство в безопасности начинается с активного слушания сотрудников',
      '📢 Поведенческие наблюдения (BBS) — выявляют скрытые риски до происшествия',
      '🏅 Zero Harm — не лозунг, а стратегия постоянного улучшения',
      '🌍 Безопасность = ключевой элемент устойчивого развития и ESG-отчётности',
      '💡 Каждый риск-ассессмент — возможность повысить зрелость safety culture',
      '🤲 Останови работу, если есть сомнение. Stop Work Authority — право каждого',
      '🧭 Safety walk лидеров — инструмент доверия, а не контроля',
      '🧠 Микропаузы и mindfulness снижают количество ошибок из-за усталости',
      '🔄 Инциденты повторяются там, где не учатся на прошлых уроках',
      '📈 Индекс вовлечённости сотрудников в безопасность = KPI зрелости компании',
    ],
    en: [
      '🦺 Proper PPE inspection and usage is a key element of personal responsibility culture',
      '⚠️ Three-point contact rule for work at height — world-class standard (ANSI Z359)',
      '🔒 LOTO: Lockout and Tagout — prevents 80% of equipment incidents',
      '👀 5S and visual management — foundation of a safe production environment',
      '🚨 Practice evacuation drills: knowing routes is important, but practice makes perfect',
      '🧯 Fire extinguisher inspection — part of daily safety walk',
      '📋 JSA/TRA before work — risk analysis before start reduces incident probability by 60%',
      '🦾 Ergonomics — investment in health and long-term personnel productivity',
      '⚡ Electrical safety: insulation test and marking verification — critical before energizing',
      '🌡️ Heat stress management — part of occupational health program (ISO 45001 §8.1)',
      '🔊 Active noise management — step towards reducing occupational hearing diseases',
      '🧪 MSDS/safety data sheet — must always be available when working with chemicals',
      '🚧 Physical and visual barriers — tool for predictable safety culture',
      '📱 Work distraction = violation of golden rules. Focus = saved lives',
      '🤝 Safe buddy system — double control for high-risk work',
      '💨 Gas analysis and confined space ventilation — mandatory permit condition',
      '🏗️ Scaffolding, platforms and towers inspection — part of work permit program',
      '🚛 Minimum safe distance 3m from equipment — ISO/ANSI standard',
      '🔧 Defect-free tools = zero tolerance for safety compromises',
      '📊 Near-miss = free lesson. Analyze and share insights with team',
      '👂 Safety leadership begins with active listening to employees',
      '📢 Behavioral observations (BBS) — identify hidden risks before incidents',
      '🏅 Zero Harm — not a slogan, but a strategy of continuous improvement',
      '🌍 Safety = key element of sustainable development and ESG reporting',
      '💡 Every risk assessment — opportunity to improve safety culture maturity',
      '🤲 Stop work if in doubt. Stop Work Authority — everyone\'s right',
      '🧭 Leadership safety walks — tool of trust, not control',
      '🧠 Micro-breaks and mindfulness reduce fatigue-related errors',
      '🔄 Incidents repeat where lessons from the past are not learned',
      '📈 Employee safety engagement index = company maturity KPI',
    ],
  };

  const t = translations[language];
  const safetyTips = useMemo(() => safetyTipsTranslations[language], [language]);

  const [currentTip, setCurrentTip] = useState(() =>
    safetyTipsTranslations.ru[Math.floor(Math.random() * safetyTipsTranslations.ru.length)]
  );

  const [todayMinutes, setTodayMinutes]   = useState(() => parseInt(localStorage.getItem('pomodoroTodayMinutes') || '0'));
  const [streak, setStreak]               = useState(() => parseInt(localStorage.getItem('pomodoroStreak') || '0'));
  const [completedTasks, setCompletedTasks] = useState(0);
  const [sessionCount, setSessionCount]   = useState(() => parseInt(localStorage.getItem('pomodoroSessionCount') || '0'));

  // Timer
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            if (minutes === 0) {
              setIsRunning(false);
              playChime();
              setSessionCount(c => c + 1);
              setTodayMinutes(m => m + totalMinutes);
              setStreak(s => s + 1);
              showNotification();
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
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, minutes, totalMinutes, safetyTips]);

  // Rotate tip every 30s
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]), 30000);
    return () => clearInterval(id);
  }, [isRunning, safetyTips]);

  // Update tip on language switch
  useEffect(() => {
    setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
  }, [language, safetyTips]);

  // Audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (ambientSound !== 'none') {
      audioRef.current.load();
      audioRef.current.volume = 0.5;
      setVolume(0.5);
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [ambientSound]);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // Persist stats
  useEffect(() => { localStorage.setItem('pomodoroTodayMinutes', todayMinutes.toString()); }, [todayMinutes]);
  useEffect(() => { localStorage.setItem('pomodoroStreak', streak.toString()); }, [streak]);
  useEffect(() => { localStorage.setItem('pomodoroSessionCount', sessionCount.toString()); }, [sessionCount]);

  // Notifications
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const handleStart  = () => setIsRunning(r => !r);
  const handleReset  = () => { setIsRunning(false); setMinutes(totalMinutes); setSeconds(0); };
  const handlePreset = (m) => { setTotalMinutes(m); setMinutes(m); setSeconds(0); setIsRunning(false); };
  const handleDial   = (m) => { if (!isRunning) { setTotalMinutes(m); setMinutes(m); setSeconds(0); } };

  const playChime = () => {
    try { const a = new Audio('End_timer.mp3'); a.volume = 0.5; a.play().catch(() => {}); } catch (_) {}
  };
  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro завершен! 🎉', { body: 'Время сделать перерыв и размяться' });
    }
  };

  const totalSec     = totalMinutes * 60;
  const remainSec    = minutes * 60 + seconds;
  const progress     = ((totalSec - remainSec) / totalSec) * 100;
  const circleR      = 130;
  const circumference = 2 * Math.PI * circleR;

  const getBackgroundImage = () => {
    const map = { forest: 'images/forest_1.webp', forest2: 'images/forest_2.webp', ocean: 'images/ocean.webp', construction: 'images/construction.webp' };
    return map[ambientSound] || null;
  };

  const bgImage = getBackgroundImage();

  const soundButtons = [
    { id: 'none',         icon: 'fa-volume-mute',  label: t.silence,      activeColor: BP.navyMid },
    { id: 'forest',       icon: 'fa-tree',         label: t.forest,       activeColor: '#166534' },
    { id: 'forest2',      icon: 'fa-leaf',         label: t.forest2,      activeColor: '#14532d' },
    { id: 'ocean',        icon: 'fa-water',        label: t.ocean,        activeColor: '#1e3a5f' },
    { id: 'construction', icon: 'fa-hammer',       label: t.construction, activeColor: '#7c2d12' },
  ];

  return (
    <div
      className="min-h-screen p-2 md:p-4 lg:p-6 relative"
      style={{
        backgroundImage: bgImage
          ? `linear-gradient(rgba(15,28,46,0.78),rgba(27,43,69,0.82)), url(${bgImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <audio ref={audioRef} loop preload="none"
        src={ambientSound === 'forest' ? 'Forest.mp3' : ambientSound === 'forest2' ? 'Forest_2.mp3' : ambientSound === 'ocean' ? 'Ocean.mp3' : ambientSound === 'construction' ? 'construction_site.mp3' : ''}
      />

      <div className="max-w-7xl mx-auto">

        {/* ======= HEADER ======= */}
        <header className="text-center mb-6 slide-in relative">
          {/* Language switcher */}
          <div className="absolute right-0 top-0 flex gap-1 z-50">
            {['ru', 'en'].map(lang => (
              <button key={lang} onClick={() => setLanguage(lang)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={language === lang
                  ? { background: BP.gold, color: BP.navy }
                  : { background: 'rgba(255,255,255,0.08)', color: BP.textMuted, border: '1px solid rgba(255,255,255,0.15)' }
                }
              >
                <span>{lang === 'ru' ? '🇷🇺' : '🇺🇸'}</span>
                <span>{lang === 'ru' ? 'Rus' : 'Eng'}</span>
              </button>
            ))}
          </div>

          {/* Logo + Title */}
          <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-3"
            style={{ background: 'rgba(15,28,46,0.7)', border: `1px solid rgba(212,160,23,0.3)` }}>
            <a href="https://bestpracticeai.ru/" target="_blank" rel="noopener noreferrer"
              className="hover:scale-105 transition-transform block">
              <img src="images/BP.png" alt="Best Practice" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
                style={{ boxShadow: `0 0 16px rgba(212,160,23,0.4)` }} />
            </a>
            <div className="text-left">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight" style={{ color: BP.gold }}>
                Safety Pomodoro
              </h1>
              <p className="text-xs md:text-sm font-medium tracking-widest mt-0.5" style={{ color: BP.textMuted }}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* ======= MAIN GRID ======= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ===== LEFT: TIMER + SOUNDS ===== */}
          <div className="lg:col-span-2 space-y-5">

            {/* Timer Card */}
            <FadeIn delay={100} duration={700}>
              <GlassCard className="p-6 md:p-8">
                <div className="hazard-stripe h-2 rounded-full mb-6 opacity-80"></div>

                {/* Timer ring */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <svg className="progress-ring" width="260" height="260">
                      <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={BP.gold} />
                          <stop offset="100%" stopColor={BP.goldLight} />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                      </defs>
                      {/* Track */}
                      <circle cx="130" cy="130" r={circleR}
                        stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
                      {/* Progress */}
                      <circle className="progress-ring__circle"
                        cx="130" cy="130" r={circleR}
                        stroke="url(#gold-gradient)" strokeWidth="12" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress / 100)}
                        filter="url(#glow)"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl md:text-6xl font-extrabold tabular-nums tracking-tight" style={{ color: BP.text }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className="mt-2 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                        style={{
                          background: isRunning ? `rgba(212,160,23,0.2)` : 'rgba(255,255,255,0.06)',
                          color: isRunning ? BP.gold : BP.textMuted,
                          border: `1px solid ${isRunning ? BP.gold : 'rgba(255,255,255,0.1)'}`,
                        }}>
                        {isRunning ? t.inWork : t.onPause}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex justify-center gap-4 mb-6">
                  <GradientBorderButton onClick={handleStart} isActive={isRunning} className="transform hover:scale-105">
                    <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                    {isRunning ? t.pause : t.start}
                  </GradientBorderButton>
                  <RippleButton onClick={handleReset}
                    className="px-8 py-4 rounded-2xl font-semibold text-lg neo-button transition-all transform hover:scale-105">
                    <i className="fas fa-redo mr-2"></i>{t.reset}
                  </RippleButton>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[20, 25, 30, 40].map(p => (
                    <RippleButton key={p} onClick={() => handlePreset(p)}
                      className={`py-3 rounded-xl font-medium transition-all enhanced-button text-sm`}
                      style={totalMinutes === p
                        ? { background: `linear-gradient(135deg, ${BP.gold}, ${BP.goldLight})`, color: BP.navy, fontWeight: 700 }
                        : { background: 'rgba(255,255,255,0.06)', color: BP.text, border: '1px solid rgba(255,255,255,0.1)' }
                      }>
                      <i className="fas fa-clock mr-1.5"></i>{p} {t.minutes}
                    </RippleButton>
                  ))}
                </div>

                {/* Custom slider */}
                <div className="rounded-xl p-4" style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid rgba(212,160,23,0.1)` }}>
                  <label className="block text-xs font-medium mb-2" style={{ color: BP.textMuted }}>
                    {t.setTime}: <span style={{ color: BP.gold, fontWeight: 700 }}>{totalMinutes} {t.minutes}</span>
                  </label>
                  <input type="range" min="1" max="60" value={totalMinutes}
                    onChange={e => handleDial(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${BP.gold} 0%, ${BP.gold} ${(totalMinutes/60)*100}%, rgba(255,255,255,0.1) ${(totalMinutes/60)*100}%, rgba(255,255,255,0.1) 100%)` }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: BP.textMuted }}>
                    {[1, 15, 30, 45, 60].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Sound Card */}
            <FadeIn delay={300} duration={700}>
              <GlassCard className="p-5">
                <SectionHeader icon="fas fa-music" iconColor="#8b5cf6">{t.backgroundSounds}</SectionHeader>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  {soundButtons.map(({ id, icon, label, activeColor }) => (
                    <RippleButton key={id} onClick={() => setAmbientSound(id)}
                      className="py-2.5 px-3 rounded-xl transition-all enhanced-button text-sm font-medium"
                      style={ambientSound === id
                        ? { background: activeColor, color: '#fff', border: `1px solid rgba(255,255,255,0.2)` }
                        : { background: 'rgba(255,255,255,0.05)', color: BP.text, border: '1px solid rgba(255,255,255,0.08)' }
                      }>
                      <i className={`fas ${icon} mr-1.5`}></i>{label}
                    </RippleButton>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <i className="fas fa-volume-down" style={{ color: BP.textMuted }}></i>
                  <input type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(to right, ${BP.gold} 0%, ${BP.gold} ${volume*100}%, rgba(255,255,255,0.1) ${volume*100}%, rgba(255,255,255,0.1) 100%)` }}
                  />
                  <i className="fas fa-volume-up" style={{ color: BP.textMuted }}></i>
                </div>
              </GlassCard>
            </FadeIn>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-5">

            {/* Safety Tip */}
            <FadeIn delay={200} duration={700}>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 safety-pulse"
                    style={{ background: `linear-gradient(135deg, ${BP.gold}, ${BP.goldDark})` }}>
                    <i className="fas fa-exclamation-triangle text-sm" style={{ color: BP.navy }}></i>
                  </div>
                  <h3 className="text-base font-semibold" style={{ color: BP.text }}>{t.safetyTip}</h3>
                </div>

                <div className="rounded-xl p-4 text-sm leading-relaxed mb-4"
                  style={{ background: 'rgba(212,160,23,0.08)', borderLeft: `3px solid ${BP.gold}`, color: BP.text }}>
                  {currentTip}
                </div>

                <button onClick={() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)])}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${BP.goldDark}, ${BP.gold})`, color: BP.navy }}>
                  <i className="fas fa-sync-alt"></i>{t.newTip}
                </button>
              </GlassCard>
            </FadeIn>

            {/* Daily Stats */}
            <FadeIn delay={400} duration={700}>
              <GlassCard className="p-5">
                <SectionHeader icon="fas fa-chart-line" iconColor="#60a5fa">{t.dailyStats}</SectionHeader>
                <div className="space-y-3">
                  {[
                    { label: t.series,       value: streak,         icon: 'fas fa-fire',         cls: 'stat-blue',   vc: '#60a5fa', tip: language === 'ru' ? 'Pomodoro сессий подряд' : 'Pomodoro sessions in a row' },
                    { label: t.sessions,     value: sessionCount,   icon: 'fas fa-check-circle', cls: 'stat-green',  vc: '#34d399', tip: language === 'ru' ? 'Сессий сегодня' : 'Sessions today' },
                    { label: t.minutesCount, value: todayMinutes,   icon: 'fas fa-clock',        cls: 'stat-purple', vc: '#a78bfa', tip: language === 'ru' ? 'Минут продуктивной работы' : 'Minutes of focused work' },
                    { label: t.tasks,        value: completedTasks, icon: 'fas fa-check-double', cls: 'stat-gold',   vc: BP.gold,   tip: language === 'ru' ? 'Завершённых задач' : 'Completed tasks' },
                  ].map(({ label, value, icon, cls, vc, tip }) => (
                    <Tooltip key={label} text={tip}>
                      <div className={`flex justify-between items-center p-3 rounded-xl cursor-pointer card-3d ${cls}`}>
                        <span className="text-sm" style={{ color: BP.text }}>
                          <i className={`${icon} mr-2`} style={{ color: vc }}></i>{label}
                        </span>
                        <span className="text-xl font-extrabold" style={{ color: vc }}>{value}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Calendar */}
            <FadeIn delay={600} duration={700}>
              <GlassCard className="p-5">
                <SectionHeader icon="fas fa-calendar-alt" iconColor="#f472b6">{t.calendar}</SectionHeader>
                <MiniCalendar language={language} />
              </GlassCard>
            </FadeIn>

            {/* Daily Tasks */}
            <FadeIn delay={800} duration={700}>
              <GlassCard className="p-5">
                <SectionHeader icon="fas fa-tasks" iconColor="#818cf8">{t.dailyTasks}</SectionHeader>
                <QuickNotes
                  onTaskToggle={count => setCompletedTasks(count)}
                  translations={t}
                  language={language}
                />
              </GlassCard>
            </FadeIn>

          </div>
        </div>

        {/* ======= FOOTER ======= */}
        <footer className="mt-8 pb-4 text-center">
          <a href="https://bestpracticeai.ru/" target="_blank" rel="noopener noreferrer"
            className="footer-brand inline-flex items-center gap-2 justify-center group">
            <img src="images/BP.png" alt="Best Practice" className="w-6 h-6 rounded-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <span style={{ color: BP.textMuted }}>
              {t.madeBy} <span className="font-semibold" style={{ color: BP.gold }}>Best Practice AI</span>
            </span>
            <i className="fas fa-external-link-alt text-xs" style={{ color: BP.textMuted }}></i>
          </a>
        </footer>

      </div>
    </div>
  );
}

// =====================
// QUICK NOTES
// =====================
function QuickNotes({ onTaskToggle, translations: t, language }) {
  const [notes, setNotes]   = useState(() => JSON.parse(localStorage.getItem('pomodoroNotes') || '[]'));
  const [newNote, setNewNote] = useState('');
  const [archive, setArchive] = useState(() => JSON.parse(localStorage.getItem('pomodoroArchive') || '[]'));
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    localStorage.setItem('pomodoroNotes', JSON.stringify(notes));
    onTaskToggle(notes.filter(n => n.completed).length);
  }, [notes, onTaskToggle]);

  useEffect(() => { localStorage.setItem('pomodoroArchive', JSON.stringify(archive)); }, [archive]);

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote, completed: false, createdAt: new Date().toISOString() }]);
      setNewNote('');
    }
  };
  const toggleNote  = id => setNotes(notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  const deleteNote  = id => setNotes(notes.filter(n => n.id !== id));
  const clearCompleted = () => {
    const done = notes.filter(n => n.completed).map(n => ({ ...n, archivedAt: new Date().toISOString() }));
    setArchive([...done, ...archive]);
    setNotes(notes.filter(n => !n.completed));
  };
  const clearArchive = () => { if (window.confirm(t.clearArchive + '?')) setArchive([]); };

  const formatDate = iso => new Date(iso).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const sorted = [...notes].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
  const completedCount = notes.filter(n => n.completed).length;
  const totalCount = notes.length;

  return (
    <div>
      {/* Add task */}
      <div className="flex gap-2 mb-3">
        <input
          type="text" value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder={t.addTask}
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: BP.text,
            caretColor: BP.gold,
          }}
        />
        <button onClick={addNote}
          className="px-3 py-2 rounded-xl transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${BP.goldDark}, ${BP.gold})`, color: BP.navy }}>
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Counter + clear */}
      {totalCount > 0 && (
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-xs" style={{ color: BP.textMuted }}>
            {t.completed}: <span style={{ color: BP.gold }}>{completedCount}</span> / {totalCount}
          </span>
          {completedCount > 0 && (
            <button onClick={clearCompleted}
              className="text-xs transition-all hover:opacity-80 flex items-center gap-1"
              style={{ color: BP.textMuted }}>
              <i className="fas fa-broom"></i>{t.clearCompleted}
            </button>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {sorted.map(note => (
          <div key={note.id}
            className="flex items-center gap-2 p-2.5 rounded-lg transition-all group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <input type="checkbox" checked={note.completed} onChange={() => toggleNote(note.id)}
              className="w-4 h-4 cursor-pointer rounded flex-shrink-0"
              style={{ accentColor: BP.gold }} />
            <span className={`flex-1 text-sm transition-all ${note.completed ? 'line-through opacity-40' : ''}`}
              style={{ color: BP.text }}>
              {note.text}
            </span>
            <button onClick={() => deleteNote(note.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1"
              style={{ color: '#f87171' }}>
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Archive */}
      {archive.length > 0 && (
        <div className="mt-4">
          <button onClick={() => setShowArchive(!showArchive)}
            className="w-full py-2 px-3 rounded-xl transition-all flex items-center justify-between text-xs font-medium"
            style={{ background: 'rgba(212,160,23,0.1)', color: BP.goldLight, border: `1px solid rgba(212,160,23,0.2)` }}>
            <span><i className="fas fa-archive mr-2"></i>{t.taskArchive} ({archive.length})</span>
            <i className={`fas fa-chevron-${showArchive ? 'up' : 'down'}`}></i>
          </button>

          {showArchive && (
            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto animate-fadeIn">
              <div className="flex justify-end mb-1">
                <button onClick={clearArchive} className="text-xs transition-all hover:opacity-80"
                  style={{ color: '#f87171' }}>
                  <i className="fas fa-trash-alt mr-1"></i>{t.clearArchive}
                </button>
              </div>
              {archive.map((task, idx) => (
                <div key={task.id || idx}
                  className="p-3 rounded-lg"
                  style={{ background: 'rgba(212,160,23,0.06)', borderLeft: `3px solid rgba(212,160,23,0.4)` }}>
                  <p className="text-xs line-through mb-1 opacity-60" style={{ color: BP.text }}>{task.text}</p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: BP.textMuted }}>
                    <i className="fas fa-check-circle" style={{ color: '#34d399' }}></i>
                    <span>{t.completedOn}: {formatDate(task.archivedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Render
const container = document.getElementById('root');
if (ReactDOM.createRoot) {
  ReactDOM.createRoot(container).render(<App />);
} else {
  ReactDOM.render(<App />, container);
}
