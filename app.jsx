const { useState, useEffect, useRef, useMemo } = React;

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
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef(null);
  // const chimeRef = useRef(null); // not used
  
  // Советы по безопасности
  const safetyTips = useMemo(() => [
    "🦺 Всегда проверяйте СИЗ перед началом работы — это ваша первая линия защиты",
    "⚠️ Правило трёх точек опоры при работе на высоте спасает жизни",
    "🔒 LOTO процедуры: блокировка и маркировка — ваша гарантия безопасности",
    "👀 Держите рабочее место в чистоте — 5S снижает риски на 40%",
    "🚨 Знайте маршруты эвакуации — в экстренной ситуации счёт идёт на секунды",
    "🧯 Проверяйте доступность огнетушителей — они должны быть в зоне видимости",
    "📋 JSA перед работой — 5 минут анализа предотвращают часы простоя",
    "🦾 Эргономика рабочего места — профилактика профзаболеваний",
    "⚡ Электробезопасность: проверяйте изоляцию инструментов перед работой",
    "🌡️ Контролируйте микроклимат — тепловой стресс снижает внимание на 30%",
    "🔊 Защита слуха: снижение шума на 3 дБ = уменьшение воздействия вдвое",
    "🧪 При работе с химикатами всегда имейте под рукой паспорт безопасности",
    "🚧 Ограждайте опасные зоны — видимые барьеры предотвращают инциденты",
    "📱 Отвлечение на телефон — причина 25% несчастных случаев",
    "🤝 Работа в паре при опасных операциях — взаимный контроль спасает",
    "💨 Вентиляция замкнутых пространств — обязательна перед входом",
    "🏗️ Проверяйте целостность лесов и подмостей перед использованием",
    "🚛 Безопасная дистанция от движущейся техники — минимум 3 метра",
    "🔧 Исправный инструмент — залог безопасной работы",
    "📊 Анализируйте near-miss случаи — это бесплатные уроки безопасности"
  ], []);
  
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
  
  // Управление фоновым звуком
  useEffect(() => {
    if (audioRef.current) {
      if (ambientSound !== 'none') {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
      audioRef.current.volume = volume;
    }
  }, [ambientSound, volume]);

  // Перезагружать источник при смене звука
  useEffect(() => {
    if (audioRef.current) {
      try { audioRef.current.load(); } catch (_) {}
    }
  }, [ambientSound]);
  
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
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-4 md:p-8">
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
        <header className="text-center mb-8 slide-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
            <img src="Coloured HH Small.png" alt="Каска" className="w-12 h-12 object-contain" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Safety Pomodoro</h1>
            <i className="fas fa-shield-alt text-3xl text-green-400"></i>
          </div>
          <p className="text-white/80 mt-3 text-lg">Продуктивность с заботой о безопасности</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Таймер */}
          <div className="lg:col-span-2 space-y-6">
            {/* Основной блок таймера */}
            <div className="glass rounded-3xl p-8 shadow-2xl slide-in">
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
                      {isRunning ? 'В работе' : 'На паузе'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Кнопки управления */}
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={handleStart}
                  className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 ${
                    isRunning 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' 
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                  }`}
                >
                  <i className={`fas ${isRunning ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                  {isRunning ? 'Пауза' : 'Старт'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-4 rounded-2xl font-semibold text-lg neo-button transition-all transform hover:scale-105"
                >
                  <i className="fas fa-redo mr-2"></i>
                  Сброс
                </button>
              </div>
              
              {/* Пресеты времени */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[20, 25, 30, 40].map(preset => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      totalMinutes === preset 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white/80 hover:bg-white text-gray-700 shadow'
                    }`}
                  >
                    <i className="fas fa-clock mr-2"></i>
                    {preset} мин
                  </button>
                ))}
              </div>
              
              {/* Кастомный выбор времени */}
              <div className="bg-gray-100 rounded-2xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Установить время: {totalMinutes} минут
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
            
            {/* Блок управления звуком */}
            <div className="glass rounded-2xl p-6 shadow-xl slide-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-music mr-2 text-purple-500"></i>
                Фоновые звуки
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <button
                  onClick={() => setAmbientSound('none')}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    ambientSound === 'none' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-volume-mute mr-2"></i>
                  Тишина
                </button>
                <button
                  onClick={() => setAmbientSound('forest')}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    ambientSound === 'forest' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-tree mr-2"></i>
                  Лес
                </button>
                <button
                  onClick={() => setAmbientSound('forest2')}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    ambientSound === 'forest2' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-leaf mr-2"></i>
                  Лес 2
                </button>
                <button
                  onClick={() => setAmbientSound('ocean')}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    ambientSound === 'ocean' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-water mr-2"></i>
                  Океан
                </button>
                <button
                  onClick={() => setAmbientSound('construction')}
                  className={`py-3 px-4 rounded-xl transition-all ${
                    ambientSound === 'construction' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
                  }`}
                >
                  <i className="fas fa-hammer mr-2"></i>
                  Стройка
                </button>
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
          </div>
          
          {/* Правая колонка - Советы и статистика */}
          <div className="space-y-6">
            {/* Совет по безопасности */}
            <div className="glass rounded-2xl p-6 shadow-xl slide-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center safety-pulse">
                  <i className="fas fa-exclamation-triangle text-gray-800"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Совет по безопасности</h3>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border-l-4 border-yellow-400">
                <p className="text-gray-700 leading-relaxed">{currentTip}</p>
              </div>
              <button
                onClick={() => setCurrentTip(safetyTips[Math.floor(Math.random() * safetyTips.length)])}
                className="mt-4 w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium rounded-xl transition-all"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Новый совет
              </button>
            </div>
            
            {/* Статистика */}
            <div className="glass rounded-2xl p-6 shadow-xl slide-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-chart-line mr-2 text-blue-500"></i>
                Статистика дня
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-gray-600">
                    <i className="fas fa-fire mr-2 text-orange-500"></i>
                    Серия
                  </span>
                  <span className="text-2xl font-bold text-blue-600">{streak}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-gray-600">
                    <i className="fas fa-check-circle mr-2 text-green-500"></i>
                    Сессий
                  </span>
                  <span className="text-2xl font-bold text-green-600">{sessionCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-600">
                    <i className="fas fa-clock mr-2 text-purple-500"></i>
                    Минут
                  </span>
                  <span className="text-2xl font-bold text-purple-600">{todayMinutes}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                  <span className="text-gray-600">
                    <i className="fas fa-check-double mr-2 text-yellow-500"></i>
                    Задач
                  </span>
                  <span className="text-2xl font-bold text-yellow-600">{completedTasks}</span>
                </div>
              </div>
            </div>
            
            {/* Задачи на день */}
            <div className="glass rounded-2xl p-6 shadow-xl slide-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                <i className="fas fa-sticky-note mr-2 text-indigo-500"></i>
                Задачи на день
              </h3>
              <QuickNotes onTaskToggle={(completedCount) => setCompletedTasks(completedCount)} />
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент задач на день
function QuickNotes({ onTaskToggle }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('pomodoroNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  
  useEffect(() => {
    localStorage.setItem('pomodoroNotes', JSON.stringify(notes));
    // Подсчитываем завершенные задачи и передаем в родительский компонент
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
          placeholder="Добавить задачу..."
          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addNote}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {notes.map(note => (
          <div key={note.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={note.completed}
              onChange={() => toggleNote(note.id)}
              className="w-4 h-4 text-blue-600"
            />
            <span className={`flex-1 text-sm ${note.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {note.text}
            </span>
            <button
              onClick={() => deleteNote(note.id)}
              className="text-red-500 hover:text-red-700 text-sm"
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
