const { useState, useEffect, useRef, useMemo } = React;

// Glass card style (shared)
const glassStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(30px)',
  WebkitBackdropFilter: 'blur(30px)',
  border: '1px solid rgba(255, 255, 255, 0.12)'
};

// Ripple Button Component
const RippleButton = ({ children, onClick, className = "", ...props }) => {
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
        const rect = e.target.getBoundingClientRect();
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        onClick && onClick(e);
      }}
      {...props}
    >
      {isRippling ? (
        <span
          className="ripple absolute w-5 h-5 bg-white/30 rounded-full pointer-events-none"
          style={{
            left: coords.x - 10,
            top: coords.y - 10,
            animation: 'ripple-effect 0.6s ease-out forwards'
          }}
        />
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// Gradient Border Button Component
const GradientBorderButton = ({ children, onClick, isActive = false, className = "", ...props }) => {
  return (
    <button
      className={`gradient-border-btn relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-none p-[2px] ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className={`gradient-border-span relative z-[1] w-full rounded-2xl px-8 py-4 text-lg font-semibold backdrop-blur-md transition-all ${
        isActive
          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 shadow-lg'
          : 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
      }`}>
        {children}
      </span>
    </button>
  );
};

// FadeIn Animation Component
const FadeIn = ({ children, delay = 0, duration = 500, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Основной компонент приложения
function App() {
  // Состояние таймера
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  // Состояние аудио
  const [ambientSound, setAmbientSound] = useState('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);

  // Состояние языка
  const [language, setLanguage] = useState('ru');

  // Переводы
  const translations = {
    ru: {
      title: "Safety Pomodoro",
      subtitle: "ПРОДУКТИВНАЯ БЕЗОПАСНОСТЬ",
      onPause: "На паузе",
      inWork: "В работе",
      start: "Старт",
      pause: "Пауза",
      reset: "Сброс",
      minutes: "мин",
      setTime: "Установить время",
      backgroundSounds: "Фоновые звуки",
      silence: "Тишина",
      forest: "Лес",
      forest2: "Лес 2",
      ocean: "Океан",
      construction: "Стройка",
      safetyTip: "Совет по безопасности",
      newTip: "Новый совет",
      dailyStats: "Статистика дня",
      series: "Серия",
      sessions: "Сессий",
      minutesCount: "Минут",
      tasks: "Задач",
      dailyTasks: "Задачи на день",
      addTask: "Добавить задачу...",
      completed: "Завершено",
      madeAt: "Создано в"
    },
    en: {
      title: "Safety Pomodoro",
      subtitle: "PRODUCTIVE SAFETY",
      onPause: "On pause",
      inWork: "In work",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      minutes: "min",
      setTime: "Set time",
      backgroundSounds: "Background sounds",
      silence: "Silence",
      forest: "Forest",
      forest2: "Forest 2",
      ocean: "Ocean",
      construction: "Construction",
      safetyTip: "Safety tip",
      newTip: "New tip",
      dailyStats: "Daily statistics",
      series: "Series",
      sessions: "Sessions",
      minutesCount: "Minutes",
      tasks: "Tasks",
      dailyTasks: "Daily tasks",
      addTask: "Add task...",
      completed: "Completed",
      madeAt: "Made at"
    }
  };

  // Советы по безопасности на двух языках
  const safetyTipsTranslations = {
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
      "📈 Индекс вовлечённости сотрудников в безопасность = KPI зрелости компании"
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
      "📈 Employee safety engagement index = company maturity KPI"
    ]
  };

  const t = translations[language];

  // Советы по безопасности с учетом языка
  const safetyTips = useMemo(() => safetyTipsTranslations[language], [language]);

  const [currentTip, setCurrentTip] = useState(() =>
    safetyTips[Math.floor(Math.random() * safetyTips.length)]
  );

  // Статистика
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  // Эффект таймера
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              setIsRunning(false);
              playChime();
              setSessionCount(prev => prev + 1);
              setTodayMinutes(prev => prev + totalMinutes);
              setStreak(prev => prev + 1);
              showNotification();
              setMinutes(totalMinutes);
              setSeconds(0);
              setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
              return 0;
            }
            setMinutes(prevMinutes => prevMinutes - 1);
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, totalMinutes, safetyTips]);

  // Смена советов каждые 30 секунд во время работы
  useEffect(() => {
    if (!isRunning) return;
    const tipInterval = setInterval(() => {
      setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
    }, 30000);
    return () => clearInterval(tipInterval);
  }, [isRunning, safetyTips]);

  // Обновление текущего совета при смене языка
  useEffect(() => {
    setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)]);
  }, [language, safetyTips]);

  // Управление фоновым звуком
  useEffect(() => {
    if (audioRef.current) {
      if (ambientSound !== 'none') {
        audioRef.current.load();
        audioRef.current.volume = 0.5;
        setVolume(0.5);
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [ambientSound]);

  // Управление громкостью
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Функции управления
  const handleStart = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(totalMinutes);
    setSeconds(0);
  };

  const handlePreset = (presetMinutes) => {
    setTotalMinutes(presetMinutes);
    setMinutes(presetMinutes);
    setSeconds(0);
    setIsRunning(false);
  };

  const handleDialChange = (newMinutes) => {
    if (!isRunning) {
      setTotalMinutes(newMinutes);
      setMinutes(newMinutes);
      setSeconds(0);
    }
  };

  // Звук завершения таймера
  const playChime = () => {
    try {
      const audio = new Audio('End_timer.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('End timer sound failed:', e));
    } catch (e) {
      console.log('End timer sound failed:', e);
    }
  };

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro завершен! 🎉', {
        body: 'Время сделать перерыв и размяться',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f59e0b"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>'
      });
    }
  };

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Расчет прогресса
  const totalSeconds = totalMinutes * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  // Функция для получения фонового изображения
  const getBackgroundImage = () => {
    switch (ambientSound) {
      case 'forest': return 'images/forest_1.webp';
      case 'forest2': return 'images/forest_2.webp';
      case 'ocean': return 'images/ocean.webp';
      case 'construction': return 'images/construction.webp';
      default: return null;
    }
  };

  return (
    <div
      className="min-h-screen p-2 md:p-4 lg:p-8 relative"
      style={{
        backgroundImage: getBackgroundImage()
          ? `linear-gradient(rgba(10, 22, 40, 0.82), rgba(10, 18, 38, 0.85)), url(${getBackgroundImage()})`
          : 'linear-gradient(135deg, #0a1628 0%, #0f2444 55%, #1a3565 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Аудио элементы */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        src={
          ambientSound === 'forest' ? 'Forest.mp3'
          : ambientSound === 'forest2' ? 'Forest_2.mp3'
          : ambientSound === 'ocean' ? 'Ocean.mp3'
          : ambientSound === 'construction' ? 'construction_site.mp3'
          : ''
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <header className="text-center mb-4 md:mb-8 slide-in">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-white/8 backdrop-blur-lg rounded-full px-4 md:px-6 py-2 md:py-3 border border-amber-400/20"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <a href="https://bestpracticeai.ru/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="images/BP.png" alt="Best Practice" className="w-10 h-10 md:w-14 md:h-14 object-contain rounded-full" />
            </a>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">Safety Pomodoro</h1>
          </div>
          <p className="text-amber-400/80 mt-2 md:mt-3 text-sm md:text-base tracking-widest font-semibold uppercase">{t.subtitle}</p>
        </header>

        {/* Переключатель языков */}
        <div className="flex justify-center mb-4 md:absolute md:top-4 md:right-4 md:mb-0 z-50">
          <div className="flex gap-2 backdrop-blur-lg rounded-full p-1 border border-white/15"
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setLanguage('ru')}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                language === 'ru'
                  ? 'bg-amber-500/30 text-white border border-amber-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">🇷🇺</span>
              <span className="text-sm font-medium">Rus</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                language === 'en'
                  ? 'bg-amber-500/30 text-white border border-amber-400/40'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">🇺🇸</span>
              <span className="text-sm font-medium">Eng</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Таймер */}
          <div className="lg:col-span-2 space-y-6">
            {/* Основной блок таймера */}
            <FadeIn delay={100} duration={800}>
              <div className="glass rounded-3xl p-8 shadow-2xl slide-in" style={glassStyle}>
                <div className="hazard-stripe h-3 rounded-full mb-6"></div>

                {/* Дисплей таймера */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <svg className="progress-ring" width="280" height="280">
                      <defs>
                        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="140" cy="140" r="130"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        className="progress-ring__circle"
                        cx="140" cy="140" r="130"
                        stroke="url(#progress-gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 130}`}
                        strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-6xl md:text-7xl font-bold text-white tabular-nums"
                        style={{ textShadow: '0 0 30px rgba(245,158,11,0.3)' }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className={`mt-2 text-sm font-semibold tracking-widest uppercase px-3 py-1 rounded-full ${
                        isRunning
                          ? 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                          : 'text-white/50 bg-white/5 border border-white/10'
                      }`}>
                        {isRunning ? t.inWork : t.onPause}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex justify-center gap-4 mb-6">
                  <GradientBorderButton
                    onClick={handleStart}
                    isActive={isRunning}
                    className="transform hover:scale-105"
                  >
                    <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                    {isRunning ? t.pause : t.start}
                  </GradientBorderButton>
                  <RippleButton
                    onClick={handleReset}
                    className="px-8 py-4 rounded-2xl font-semibold text-lg neo-button transition-all transform hover:scale-105"
                  >
                    <i className="fas fa-redo mr-2"></i>
                    {t.reset}
                  </RippleButton>
                </div>

                {/* Пресеты времени */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[20, 25, 30, 40].map(preset => (
                    <RippleButton
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className={`py-3 rounded-xl font-medium transition-all enhanced-button ${
                        totalMinutes === preset
                          ? 'bg-amber-500 text-gray-900 shadow-md shadow-amber-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                      }`}
                    >
                      <i className="fas fa-clock mr-2"></i>
                      {preset} {t.minutes}
                    </RippleButton>
                  ))}
                </div>

                {/* Кастомный выбор времени */}
                <div className="rounded-2xl p-4 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {t.setTime}: <span className="text-amber-400 font-bold">{totalMinutes}</span> {t.minutes}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={totalMinutes}
                    onChange={(e) => handleDialChange(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(totalMinutes/60)*100}%, rgba(255,255,255,0.15) ${(totalMinutes/60)*100}%, rgba(255,255,255,0.15) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-white/35 mt-1">
                    <span>1</span><span>15</span><span>30</span><span>45</span><span>60</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Блок управления звуком */}
            <FadeIn delay={300} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="fas fa-music mr-2 text-amber-400"></i>
                  {t.backgroundSounds}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  <RippleButton
                    onClick={() => setAmbientSound('none')}
                    className={`py-3 px-4 rounded-xl transition-all enhanced-button text-sm ${
                      ambientSound === 'none'
                        ? 'bg-slate-600 text-white border border-slate-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                  >
                    <i className="fas fa-volume-mute mr-2"></i>{t.silence}
                  </RippleButton>
                  <RippleButton
                    onClick={() => setAmbientSound('forest')}
                    className={`py-3 px-4 rounded-xl transition-all enhanced-button text-sm ${
                      ambientSound === 'forest'
                        ? 'bg-green-600 text-white border border-green-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                  >
                    <i className="fas fa-tree mr-2"></i>{t.forest}
                  </RippleButton>
                  <RippleButton
                    onClick={() => setAmbientSound('forest2')}
                    className={`py-3 px-4 rounded-xl transition-all enhanced-button text-sm ${
                      ambientSound === 'forest2'
                        ? 'bg-emerald-700 text-white border border-emerald-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                  >
                    <i className="fas fa-leaf mr-2"></i>{t.forest2}
                  </RippleButton>
                  <RippleButton
                    onClick={() => setAmbientSound('ocean')}
                    className={`py-3 px-4 rounded-xl transition-all enhanced-button text-sm ${
                      ambientSound === 'ocean'
                        ? 'bg-blue-600 text-white border border-blue-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                  >
                    <i className="fas fa-water mr-2"></i>{t.ocean}
                  </RippleButton>
                  <RippleButton
                    onClick={() => setAmbientSound('construction')}
                    className={`py-3 px-4 rounded-xl transition-all enhanced-button text-sm ${
                      ambientSound === 'construction'
                        ? 'bg-amber-500 text-gray-900 border border-amber-300/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                  >
                    <i className="fas fa-hammer mr-2"></i>{t.construction}
                  </RippleButton>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-volume-down text-white/30 text-sm"></i>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${volume*100}%, rgba(255,255,255,0.15) ${volume*100}%, rgba(255,255,255,0.15) 100%)`
                    }}
                  />
                  <i className="fas fa-volume-up text-white/30 text-sm"></i>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Правая колонка - Советы и статистика */}
          <div className="space-y-6">
            {/* Совет по безопасности */}
            <FadeIn delay={500} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center safety-pulse flex-shrink-0"
                    style={{ boxShadow: '0 0 12px rgba(245,158,11,0.5)' }}>
                    <i className="fas fa-exclamation-triangle text-gray-900"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{t.safetyTip}</h3>
                </div>
                <div className="rounded-xl p-4 border-l-4 border-amber-500/70"
                  style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <p className="text-white/85 leading-relaxed text-sm">{currentTip}</p>
                </div>
                <button
                  onClick={() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)])}
                  className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-xl transition-all"
                  style={{ boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  {t.newTip}
                </button>
              </div>
            </FadeIn>

            {/* Статистика */}
            <FadeIn delay={700} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="fas fa-chart-line mr-2 text-amber-400"></i>
                  {t.dailyStats}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl border border-amber-800/25"
                    style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <span className="text-white/65 text-sm">
                      <i className="fas fa-fire mr-2 text-amber-400"></i>{t.series}
                    </span>
                    <span className="text-xl font-bold text-amber-400">{streak}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-green-800/25"
                    style={{ background: 'rgba(34,197,94,0.07)' }}>
                    <span className="text-white/65 text-sm">
                      <i className="fas fa-check-circle mr-2 text-green-400"></i>{t.sessions}
                    </span>
                    <span className="text-xl font-bold text-green-400">{sessionCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-blue-800/25"
                    style={{ background: 'rgba(59,130,246,0.07)' }}>
                    <span className="text-white/65 text-sm">
                      <i className="fas fa-clock mr-2 text-blue-400"></i>{t.minutesCount}
                    </span>
                    <span className="text-xl font-bold text-blue-400">{todayMinutes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border border-purple-800/25"
                    style={{ background: 'rgba(139,92,246,0.07)' }}>
                    <span className="text-white/65 text-sm">
                      <i className="fas fa-check-double mr-2 text-purple-400"></i>{t.tasks}
                    </span>
                    <span className="text-xl font-bold text-purple-400">{completedTasks}</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Задачи на день */}
            <FadeIn delay={900} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={glassStyle}>
                <h3 className="text-lg font-semibold text-white mb-4">
                  <i className="fas fa-sticky-note mr-2 text-indigo-400"></i>
                  {t.dailyTasks}
                </h3>
                <QuickNotes onTaskToggle={(completedCount) => setCompletedTasks(completedCount)} translations={t} />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 pb-2">
          <a
            href="https://bestpracticeai.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/35 hover:text-white/60 transition-colors text-xs tracking-wide group"
          >
            <img src="images/BP.png" alt="Best Practice" className="w-5 h-5 rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
            <span>{t.madeAt}</span>
            <span className="text-amber-400/60 group-hover:text-amber-400 transition-colors font-medium">bestpracticeai.ru</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

// Компонент задач на день
function QuickNotes({ onTaskToggle, translations }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('pomodoroNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('pomodoroNotes', JSON.stringify(notes));
    const completedCount = notes.filter(note => note.completed).length;
    onTaskToggle(completedCount);
  }, [notes, onTaskToggle]);

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote, completed: false }]);
      setNewNote('');
    }
  };

  const toggleNote = (id) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, completed: !note.completed } : note
    ));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder={translations.addTask}
          className="flex-1 px-3 py-2 rounded-xl border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 placeholder-white"
          style={{ background: 'rgba(255,255,255,0.08)', '--placeholder-color': 'rgba(255,255,255,0.35)' }}
        />
        <button
          onClick={addNote}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-xl transition-all font-semibold"
          style={{ boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {notes.map(note => (
          <div key={note.id} className="flex items-center gap-2 p-2 rounded-lg border border-white/10"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <input
              type="checkbox"
              checked={note.completed}
              onChange={() => toggleNote(note.id)}
              className="w-4 h-4 cursor-pointer accent-amber-500 flex-shrink-0"
            />
            <span className={`flex-1 text-sm ${note.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
              {note.text}
            </span>
            <button
              onClick={() => deleteNote(note.id)}
              className="text-red-400/60 hover:text-red-400 text-sm transition-colors flex-shrink-0"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Рендеринг приложения (React 18 с откатом)
const container = document.getElementById('root');
if (ReactDOM.createRoot) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  ReactDOM.render(<App />, container);
}
