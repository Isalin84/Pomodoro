const { useState, useEffect, useRef, useMemo } = React;

// Calendar Component
const MiniCalendar = ({ translations }) => {
  const [currentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const today = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = {
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  };

  const dayNames = {
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  };

  const lang = translations.title === "Safety Pomodoro" ? 'ru' : 'en';

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today && month === currentMonth && year === currentYear;
    days.push(
      <div
        key={day}
        className={`h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${
          isToday
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110 animate-pulse'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="text-center mb-3">
        <h4 className="text-lg font-bold text-gray-800">{monthNames[lang][month]} {year}</h4>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames[lang].map((day, index) => (
          <div key={index} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

// Shimmer Loading Component
const ShimmerCard = () => (
  <div className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-xl h-20"></div>
);

// Tooltip Component
const Tooltip = ({ children, text, position = "top" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap animate-fadeIn`}>
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      )}
    </div>
  );
};

// Badge Component
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
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
          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
          : 'bg-white/95 hover:bg-white text-gray-700 shadow'
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
  
  // Состояние аудио
  const [ambientSound, setAmbientSound] = useState('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);
  
  // Состояние языка
  const [language, setLanguage] = useState('ru');
  // const chimeRef = useRef(null); // not used
  
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
      clearCompleted: "Очистить выполненные",
      calendar: "Календарь",
      today: "Сегодня",
      taskArchive: "Архив задач",
      viewArchive: "Показать архив",
      hideArchive: "Скрыть архив",
      completedOn: "Завершено",
      noArchivedTasks: "Нет архивных задач",
      clearArchive: "Очистить архив"
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
      clearCompleted: "Clear completed",
      calendar: "Calendar",
      today: "Today",
      taskArchive: "Task Archive",
      viewArchive: "View archive",
      hideArchive: "Hide archive",
      completedOn: "Completed on",
      noArchivedTasks: "No archived tasks",
      clearArchive: "Clear archive"
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
  
  // Статистика с сохранением в localStorage
  const [todayMinutes, setTodayMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoroTodayMinutes');
    return saved ? parseInt(saved) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('pomodoroStreak');
    return saved ? parseInt(saved) : 0;
  });
  const [completedTasks, setCompletedTasks] = useState(0);
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem('pomodoroSessionCount');
    return saved ? parseInt(saved) : 0;
  });
  
  // Эффект таймера
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              // Таймер завершен
              setIsRunning(false);
              playChime();
              setSessionCount(prev => prev + 1);
              setTodayMinutes(prev => prev + totalMinutes);
              setStreak(prev => prev + 1);
              showNotification();
              // Сброс таймера
              setMinutes(totalMinutes);
              setSeconds(0);
              // Новый совет
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
        // Принудительно перезагружаем аудио при смене звука
        audioRef.current.load();
        // Устанавливаем громкость на средний уровень при включении
        audioRef.current.volume = 0.5;
        // Обновляем состояние громкости
        setVolume(0.5);
        // Воспроизводим звук
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

  // Сохранение статистики в localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroTodayMinutes', todayMinutes.toString());
  }, [todayMinutes]);

  useEffect(() => {
    localStorage.setItem('pomodoroStreak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('pomodoroSessionCount', sessionCount.toString());
  }, [sessionCount]);
  
  // Функции управления
  const handleStart = () => {
    setIsRunning(!isRunning);
  };
  
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
  
  /*
  const playChime = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" +
      "AkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAkOUqzn77ViFgU7k9n1unEiBC13yO/eizEIHWq+8+OWTAk=');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Chime play failed:', e));
  };
  */
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
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>'
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
      case 'forest':
        return 'images/forest_1.webp';
      case 'forest2':
        return 'images/forest_2.webp';
      case 'ocean':
        return 'images/ocean.webp';
      case 'construction':
        return 'images/construction.webp';
      default:
        return null;
    }
  };
  
  
  return (
    <div 
      className="min-h-screen p-2 md:p-4 lg:p-8 relative"
      style={{
        backgroundImage: getBackgroundImage() 
          ? `linear-gradient(rgba(102, 126, 234, 0.7), rgba(118, 75, 162, 0.7)), url(${getBackgroundImage()})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
          ambientSound === 'forest'
            ? 'Forest.mp3'
            : ambientSound === 'forest2'
            ? 'Forest_2.mp3'
            : ambientSound === 'ocean'
            ? 'Ocean.mp3'
            : ambientSound === 'construction'
            ? 'construction_site.mp3'
            : ''
        }
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <header className="text-center mb-4 md:mb-8 slide-in">
          <div className="inline-flex items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-lg rounded-full px-4 md:px-6 py-2 md:py-3 border border-white/30">
            <a href="https://vk.com/club224447229" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
              <img src="images/BP.png" alt="BP" className="w-10 h-10 md:w-14 md:h-14 object-contain" />
            </a>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white">Safety Pomodoro</h1>
          </div>
          <p className="text-white/80 mt-2 md:mt-3 text-sm md:text-lg">{t.subtitle}</p>
        </header>
        
        {/* Переключатель языков */}
        <div className="flex justify-center mb-4 md:absolute md:top-4 md:right-4 md:mb-0 z-50">
          <div className="flex gap-2 bg-white/20 backdrop-blur-lg rounded-full p-1 border border-white/30">
            <button
              onClick={() => setLanguage('ru')}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                language === 'ru' 
                  ? 'bg-white/30 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-lg">🇷🇺</span>
              <span className="text-sm font-medium">Rus</span>
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                language === 'en' 
                  ? 'bg-white/30 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
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
              <div className="glass rounded-3xl p-8 shadow-2xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <div className="hazard-stripe h-3 rounded-full mb-6"></div>
              
              {/* Дисплей таймера */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <svg className="progress-ring" width="280" height="280">
                    <defs>
                      <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="140"
                      cy="140"
                      r="130"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      className="progress-ring__circle"
                      cx="140"
                      cy="140"
                      r="130"
                      stroke="url(#progress-gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 130}`}
                      strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-6xl md:text-7xl font-bold text-gray-800 tabular-nums">
                      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>
                    <div className="text-gray-500 mt-2">
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
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white/80 hover:bg-white text-gray-700 shadow'
                    }`}
                  >
                    <i className="fas fa-clock mr-2"></i>
                    {preset} {t.minutes}
                  </RippleButton>
                ))}
              </div>
              
              {/* Кастомный выбор времени */}
              <div className="bg-gray-100 rounded-2xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.setTime}: {totalMinutes} {t.minutes}
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={totalMinutes}
                  onChange={(e) => handleDialChange(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(totalMinutes/60)*100}%, #e5e7eb ${(totalMinutes/60)*100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                  <span>45</span>
                  <span>60</span>
                </div>
              </div>
              </div>
            </FadeIn>
            
            {/* Блок управления звуком */}
            <FadeIn delay={300} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-music mr-2 text-purple-500"></i>
                {t.backgroundSounds}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <RippleButton
                  onClick={() => setAmbientSound('none')}
                  className={`py-3 px-4 rounded-xl transition-all enhanced-button ${
                    ambientSound === 'none' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-volume-mute mr-2"></i>
                  {t.silence}
                </RippleButton>
                <RippleButton
                  onClick={() => setAmbientSound('forest')}
                  className={`py-3 px-4 rounded-xl transition-all enhanced-button ${
                    ambientSound === 'forest' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-tree mr-2"></i>
                  {t.forest}
                </RippleButton>
                <RippleButton
                  onClick={() => setAmbientSound('forest2')}
                  className={`py-3 px-4 rounded-xl transition-all enhanced-button ${
                    ambientSound === 'forest2' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-leaf mr-2"></i>
                  {t.forest2}
                </RippleButton>
                <RippleButton
                  onClick={() => setAmbientSound('ocean')}
                  className={`py-3 px-4 rounded-xl transition-all enhanced-button ${
                    ambientSound === 'ocean' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-water mr-2"></i>
                  {t.ocean}
                </RippleButton>
                <RippleButton
                  onClick={() => setAmbientSound('construction')}
                  className={`py-3 px-4 rounded-xl transition-all enhanced-button ${
                    ambientSound === 'construction' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-hammer mr-2"></i>
                  {t.construction}
                </RippleButton>
              </div>
              <div className="flex items-center gap-3">
                <i className="fas fa-volume-down text-gray-500"></i>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <i className="fas fa-volume-up text-gray-500"></i>
              </div>
              </div>
            </FadeIn>
          </div>
          
          {/* Правая колонка - Советы и статистика */}
          <div className="space-y-6">
            {/* Совет по безопасности */}
            <FadeIn delay={500} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center safety-pulse">
                  <i className="fas fa-exclamation-triangle text-gray-800"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{t.safetyTip}</h3>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-400">
                <p className="text-gray-700 leading-relaxed">{currentTip}</p>
              </div>
              <button
                onClick={() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)])}
                className="mt-4 w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium rounded-xl transition-all"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                {t.newTip}
              </button>
              </div>
            </FadeIn>
            
            {/* Статистика */}
            <FadeIn delay={700} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-chart-line mr-2 text-blue-500"></i>
                {t.dailyStats}
              </h3>
              <div className="space-y-4">
                <Tooltip text={language === 'ru' ? 'Количество завершенных Pomodoro сессий подряд' : 'Number of completed Pomodoro sessions in a row'}>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all cursor-pointer card-3d">
                    <span className="text-gray-600">
                      <i className="fas fa-fire mr-2 text-orange-500"></i>
                      {t.series}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">{streak}</span>
                  </div>
                </Tooltip>
                <Tooltip text={language === 'ru' ? 'Общее количество завершенных сессий сегодня' : 'Total completed sessions today'}>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-all cursor-pointer card-3d">
                    <span className="text-gray-600">
                      <i className="fas fa-check-circle mr-2 text-green-500"></i>
                      {t.sessions}
                    </span>
                    <span className="text-2xl font-bold text-green-600">{sessionCount}</span>
                  </div>
                </Tooltip>
                <Tooltip text={language === 'ru' ? 'Сколько минут вы продуктивно работали сегодня' : 'How many minutes you worked productively today'}>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-all cursor-pointer card-3d">
                    <span className="text-gray-600">
                      <i className="fas fa-clock mr-2 text-purple-500"></i>
                      {t.minutesCount}
                    </span>
                    <span className="text-2xl font-bold text-purple-600">{todayMinutes}</span>
                  </div>
                </Tooltip>
                <Tooltip text={language === 'ru' ? 'Количество завершенных задач' : 'Number of completed tasks'}>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-all cursor-pointer card-3d">
                    <span className="text-gray-600">
                      <i className="fas fa-check-double mr-2 text-yellow-500"></i>
                      {t.tasks}
                    </span>
                    <span className="text-2xl font-bold text-yellow-600">{completedTasks}</span>
                  </div>
                </Tooltip>
              </div>
              </div>
            </FadeIn>
            
            {/* Календарь */}
            <FadeIn delay={900} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-calendar-alt mr-2 text-pink-500"></i>
                {t.calendar}
              </h3>
              <MiniCalendar translations={t} />
              </div>
            </FadeIn>

            {/* Задачи на день */}
            <FadeIn delay={1100} duration={800}>
              <div className="glass rounded-2xl p-6 shadow-xl slide-in" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-sticky-note mr-2 text-indigo-500"></i>
                {t.dailyTasks}
              </h3>
              <QuickNotes onTaskToggle={(completedCount) => setCompletedTasks(completedCount)} translations={t} language={language} />
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент задач на день
function QuickNotes({ onTaskToggle, translations, language }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('pomodoroNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [archive, setArchive] = useState(() => {
    const saved = localStorage.getItem('pomodoroArchive');
    return saved ? JSON.parse(saved) : [];
  });
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    localStorage.setItem('pomodoroNotes', JSON.stringify(notes));
    // Подсчитываем завершенные задачи и передаем в родительский компонент
    const completedCount = notes.filter(note => note.completed).length;
    onTaskToggle(completedCount);
  }, [notes, onTaskToggle]);

  useEffect(() => {
    localStorage.setItem('pomodoroArchive', JSON.stringify(archive));
  }, [archive]);

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote, completed: false, createdAt: new Date().toISOString() }]);
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

  // Сортируем задачи: невыполненные наверху, выполненные внизу
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  const clearCompleted = () => {
    // Архивируем завершенные задачи перед удалением
    const completedNotes = notes.filter(note => note.completed);
    const archivedTasks = completedNotes.map(note => ({
      ...note,
      archivedAt: new Date().toISOString()
    }));
    setArchive([...archivedTasks, ...archive]);
    setNotes(notes.filter(note => !note.completed));
  };

  const clearArchive = () => {
    if (window.confirm(translations.clearArchive + '?')) {
      setArchive([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', options);
  };

  const completedCount = notes.filter(note => note.completed).length;
  const totalCount = notes.length;

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder={translations.addTask}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addNote}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {totalCount > 0 && (
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-sm text-gray-600">
            {translations.completed}: {completedCount} / {totalCount}
          </span>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-red-500 hover:text-red-700 transition-all"
            >
              <i className="fas fa-broom mr-1"></i>
              {translations.clearCompleted || 'Очистить выполненные'}
            </button>
          )}
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sortedNotes.map(note => (
          <div
            key={note.id}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100"
          >
            <input
              type="checkbox"
              checked={note.completed}
              onChange={() => toggleNote(note.id)}
              className="w-4 h-4 text-blue-600 cursor-pointer"
            />
            <span className={`flex-1 text-sm transition-all duration-200 ${note.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {note.text}
            </span>
            <button
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 text-sm transition-colors"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
      </div>

      {/* Архив задач */}
      {archive.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-lg transition-all flex items-center justify-between text-sm font-medium"
          >
            <span>
              <i className={`fas fa-archive mr-2`}></i>
              {translations.taskArchive} ({archive.length})
            </span>
            <i className={`fas fa-chevron-${showArchive ? 'up' : 'down'} transition-transform`}></i>
          </button>

          {showArchive && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto animate-fadeIn">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">{translations.noArchivedTasks}</span>
                <button
                  onClick={clearArchive}
                  className="text-xs text-red-500 hover:text-red-700 transition-all"
                >
                  <i className="fas fa-trash-alt mr-1"></i>
                  {translations.clearArchive}
                </button>
              </div>
              {archive.map((task, index) => (
                <div
                  key={task.id || index}
                  className="p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border-l-4 border-purple-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 line-through mb-1">{task.text}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <i className="fas fa-check-circle text-green-500"></i>
                        <span>{translations.completedOn}: {formatDate(task.archivedAt)}</span>
                      </div>
                    </div>
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

// Рендеринг приложения (React 18 с откатом)
const container = document.getElementById('root');
if (ReactDOM.createRoot) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  ReactDOM.render(<App />, container);
}
