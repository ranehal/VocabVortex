import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Settings, 
  Zap, 
  Trash2, 
  Volume2, 
  Bookmark,
  RefreshCw,
  Star,
  Palette,
  Target,
  Trophy,
  X,
  Info,
  Lightbulb,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Theme Configurations ---
const themes = {
  verdant: {
    name: 'Verdant Luxe',
    bg: 'bg-[#051c14]',
    card: 'bg-emerald-900/30 border-emerald-500/20 backdrop-blur-xl',
    accent: 'bg-emerald-500',
    text: 'text-emerald-50',
    subText: 'text-emerald-400',
    font: 'font-sans',
    button: 'shadow-[4px_4px_10px_rgba(0,0,0,0.3),-2px_-2px_10px_rgba(255,255,255,0.05)]'
  },
  crimson: {
    name: 'Crimson Royal',
    bg: 'bg-[#1a0505]',
    card: 'bg-red-900/30 border-red-500/20 backdrop-blur-xl',
    accent: 'bg-red-600',
    text: 'text-red-50',
    subText: 'text-red-400',
    font: 'font-serif',
    button: 'shadow-[0_4px_20px_rgba(185,28,28,0.3)]'
  },
  onyx: {
    name: 'Pure Onyx',
    bg: 'bg-[#000000]',
    card: 'bg-zinc-900/50 border-zinc-700/30 backdrop-blur-md',
    accent: 'bg-zinc-100',
    text: 'text-zinc-100',
    subText: 'text-zinc-500',
    font: 'font-mono',
    button: 'border border-zinc-700'
  },
  amethyst: {
    name: 'Royal Amethyst',
    bg: 'bg-[#12051a]',
    card: 'bg-purple-900/30 border-purple-500/20 backdrop-blur-xl',
    accent: 'bg-purple-500',
    text: 'text-purple-50',
    subText: 'text-purple-400',
    font: 'font-sans',
    button: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]'
  },
  topaz: {
    name: 'Imperial Topaz',
    bg: 'bg-[#1a1205]',
    card: 'bg-amber-900/30 border-amber-500/20 backdrop-blur-xl',
    accent: 'bg-amber-500',
    text: 'text-amber-50',
    subText: 'text-amber-400',
    font: 'font-serif',
    button: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] bg-gradient-to-br from-amber-400 to-amber-600'
  },
  white: {
    name: 'Pure White',
    bg: 'bg-[#f8fafc]',
    card: 'bg-white border-slate-200 shadow-xl shadow-slate-200/50',
    accent: 'bg-blue-600',
    text: 'text-slate-900',
    subText: 'text-slate-500',
    font: 'font-sans',
    button: 'shadow-md active:shadow-sm'
  },
  amoled: {
    name: 'Space AMOLED',
    bg: 'bg-black',
    card: 'bg-black/40 border-zinc-800 backdrop-blur-2xl',
    accent: 'bg-blue-500',
    text: 'text-white',
    subText: 'text-blue-400',
    font: 'font-sans',
    button: 'shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/50'
  }
};

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS', 'TOEFL', 'GRE'];

const levelWordsMap = {
  'A1': ['Apple', 'Water', 'Friend', 'School', 'Happy', 'Small', 'Bread', 'House', 'Blue', 'Run'],
  'A2': ['Village', 'Journey', 'Kitchen', 'Famous', 'Simple', 'Advice', 'Healthy', 'Market', 'Bridge', 'Nature'],
  'B1': ['Confident', 'Opportunity', 'Manage', 'Product', 'Discuss', 'Average', 'Standard', 'Success', 'Region', 'Improve'],
  'B2': ['Analyze', 'Challenge', 'Consequence', 'Distinct', 'Flexible', 'Observe', 'Persistent', 'Relevant', 'Theoretical', 'Variable'],
  'C1': ['Acquaint', 'Beneficial', 'Coherent', 'Elaborate', 'Hypothesis', 'Inevitably', 'Justify', 'Objective', 'Prospective', 'Speculate'],
  'C2': ['Aesthetic', 'Benevolent', 'Conundrum', 'Epiphany', 'Ineffable', 'Lethargic', 'Mellifluous', 'Nefarious', 'Pleonasm', 'Ubiquitous'],
  'IELTS': ['Mitigate', 'Correlation', 'Substantial', 'Paradigm', 'Advocate', 'Synthesize', 'Empirical', 'Pragmatic', 'Viable', 'Infrastructure'],
  'TOEFL': ['Interdependence', 'Biodiversity', 'Sediment', 'Stratosphere', 'Chronological', 'Hypothesize', 'Linguistic', 'Symmetry', 'Topography', 'Vocabulary'],
  'GRE': ['Alacrity', 'Bellicose', 'Capricious', 'Ephemeral', 'Loquacious', 'Magnanimous', 'Obsequious', 'Pusillanimous', 'Sycophant', 'Vacillate']
};

// --- Components ---

const StarField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];
    let shootingStar = null;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        opacity: Math.random(),
        speed: 0.005 + Math.random() * 0.01
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0) star.speed *= -1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, star.opacity)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!shootingStar && Math.random() < 0.01) {
        shootingStar = {
          x: Math.random() * canvas.width,
          y: 0,
          vx: (Math.random() - 0.5) * 10,
          vy: 5 + Math.random() * 5,
          len: 20 + Math.random() * 30,
          opacity: 1
        };
      }

      if (shootingStar) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${shootingStar.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(shootingStar.x + shootingStar.vx * 5, shootingStar.y + shootingStar.vy * 5);
        ctx.stroke();
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.opacity -= 0.02;
        if (shootingStar.opacity <= 0) shootingStar = null;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

const WordBuilderMiniGame = () => {
  const words = ["VORTEX", "ENERGY", "FOCUS", "FLUENT", "MASTER", "GENIUS"];
  const [targetWord, setTargetWord] = useState("");
  const [collected, setCollected] = useState("");
  const [fallingLetter, setFallingLetter] = useState({ char: 'V', x: 50, y: -10 });
  const [basketPos, setBasketPos] = useState(50);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setTargetWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setBasketPos((x / window.innerWidth) * 100);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    
    const interval = setInterval(() => {
      setFallingLetter(prev => {
        if (prev.y > 100) {
          const nextChar = targetWord[collected.length] || targetWord[Math.floor(Math.random() * targetWord.length)];
          return { char: nextChar, x: Math.random() * 80 + 10, y: -10 };
        }
        if (prev.y > 80 && Math.abs(prev.x - basketPos) < 10) {
          if (prev.char === targetWord[collected.length]) {
            setCollected(c => c + prev.char);
            setScore(s => s + 10);
            if (collected.length + 1 === targetWord.length) {
              setTimeout(() => { setCollected(""); setTargetWord(words[Math.floor(Math.random() * words.length)]); }, 500);
            }
          }
          return { char: ' ', x: -100, y: 110 };
        }
        return { ...prev, y: prev.y + 2.5 };
      });
    }, 30);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      clearInterval(interval);
    };
  }, [basketPos, collected, targetWord]);

  return (
    <div className="flex flex-col items-center justify-center h-64 w-full relative overflow-hidden bg-white/5 rounded-[40px] border border-white/10">
      <div className="absolute top-6 left-8 right-8 flex justify-between items-center opacity-40">
        <span className="text-[10px] font-black tracking-widest">MINI-CHALLENGE: {targetWord}</span>
        <span className="text-[10px] font-black tracking-widest">PTS: {score}</span>
      </div>
      <div className="text-4xl font-black tracking-[0.3em] mb-12">
        {targetWord.split('').map((l, i) => (
          <span key={i} className={collected[i] ? "text-blue-400" : "opacity-10"}>{l}</span>
        ))}
      </div>
      <motion.div 
        className="absolute text-2xl font-black bg-white text-black w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ left: `${fallingLetter.x}%`, top: `${fallingLetter.y}%` }}
      >
        {fallingLetter.char}
      </motion.div>
      <div 
        className="absolute bottom-6 w-24 h-4 bg-blue-500/30 rounded-full border-t-2 border-blue-400 blur-[1px]"
        style={{ left: `${basketPos}%`, transform: 'translateX(-50%)' }}
      />
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [themeKey, setThemeKey] = useState('verdant');
  const [currentView, setCurrentView] = useState('home');
  const [level, setLevel] = useState('A2');
  const [inputWord, setInputWord] = useState('');
  const [trainerQueue, setTrainerQueue] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const activeTheme = themes[themeKey];

  const refreshSuggestions = (currentLevel) => {
    const list = levelWordsMap[currentLevel || level];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 5));
  };

  useEffect(() => {
    refreshSuggestions(level);
  }, [level]);

  const wordOfTheDay = useMemo(() => {
    const words = ["Resilient", "Ephemeral", "Luminous", "Eloquent", "Sovereign"];
    return words[new Date().getDay() % words.length];
  }, []);

  const handleStart = async (wordToUse) => {
    const word = wordToUse || inputWord;
    if (!word) return;
    
    setLoading(true);
    setCurrentView('reading');

    const apiKey = ""; // Runtime provides key
    const systemPrompt = `You are a VocabVortex AI mentor. Create educational content for the word "${word}" at ${level} level. 
    Return the response in JSON format:
    {
      "story": "A 4-sentence story using the word contextually.",
      "drills": [
        { "sentence": "A unique sentence using the word.", "explanation": "A deep insight into why this usage is effective." },
        ... (generate 6 drills)
      ],
      "bengaliDefinition": "Bengali meaning"
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate content for: ${word}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const data = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
      setCurrentStory({ word, ...data });
    } catch (err) {
      setCurrentStory({ word, story: "Error generating content. Please check your connection.", drills: [] });
    } finally {
      setLoading(false);
      setInputWord('');
    }
  };

  const handleNext = () => {
    if (trainerQueue.length > 0) {
      const next = trainerQueue[0];
      setTrainerQueue(prev => prev.slice(1));
      handleStart(next.word);
    } else {
      setCurrentView('home');
    }
  };

  const addToTrainer = (w) => {
    const cleanWord = w.replace(/[.,!?;:]/g, '');
    if (!trainerQueue.some(item => item.word.toLowerCase() === cleanWord.toLowerCase())) {
      setTrainerQueue([...trainerQueue, { word: cleanWord, level, id: Date.now() }]);
    }
    setSelectedWord(null);
    setSelectedDrill(null);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} ${activeTheme.font} transition-colors duration-700 overflow-hidden flex flex-col relative`}>
      {themeKey === 'amoled' && <StarField />}
      
      {/* Vortex Aura */}
      <motion.div 
        animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="fixed top-[-20%] right-[-10%] w-[80vw] h-[80vw] border-[1px] border-white/5 rounded-full pointer-events-none opacity-20"
      />

      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center z-20">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
            Vocab<span className={activeTheme.subText}>Vortex</span> 
            <span className="text-[10px] not-italic font-black opacity-30 block tracking-[0.3em] mt-1">Language Lab</span>
          </h1>
        </motion.div>
        <div className="flex gap-2">
          <button onClick={() => setShowThemePicker(true)} className={`${activeTheme.card} p-3 rounded-2xl ${activeTheme.button} active:scale-90 transition-transform`}><Palette size={20} /></button>
          <button className={`${activeTheme.card} p-3 rounded-2xl ${activeTheme.button}`}><Settings size={20} /></button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-6 pb-32 overflow-y-auto z-10 relative no-scrollbar">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 py-6">
              
              <div className={`${activeTheme.card} p-8 rounded-[48px] border relative overflow-hidden group`}>
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
                
                <h2 className="text-4xl font-black mb-8 leading-tight tracking-tight uppercase italic">Step into <br/><span className={activeTheme.subText}>the Vortex</span></h2>
                
                <div className="space-y-8">
                  {/* Level Selector */}
                  <div className="flex flex-wrap gap-2">
                    {levels.map(lvl => (
                      <button 
                        key={lvl} onClick={() => setLevel(lvl)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${level === lvl ? `${activeTheme.accent} text-white border-transparent shadow-2xl` : 'border-current opacity-20 hover:opacity-100'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Suggestion Engine */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Level Suggestions</span>
                      <button 
                        onClick={() => refreshSuggestions()}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <RotateCw size={12} /> Randomize
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((w, idx) => (
                        <motion.button
                          key={w} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                          onClick={() => setInputWord(w)}
                          className="bg-white/5 border border-white/5 px-4 py-2 rounded-2xl text-xs font-bold hover:bg-white/10 active:scale-95 transition-all"
                        >
                          {w}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Input Interface */}
                  <div className="relative">
                    <input 
                      type="text" placeholder={`Enter or pick a word...`} 
                      className={`w-full bg-black/30 border-2 border-white/5 rounded-[32px] py-7 px-8 outline-none focus:border-current/30 transition-all text-xl font-bold placeholder:opacity-20`}
                      value={inputWord} onChange={(e) => setInputWord(e.target.value)}
                    />
                    <button 
                      onClick={() => handleStart()}
                      className={`absolute right-3 top-3 bottom-3 ${activeTheme.accent} px-10 rounded-[24px] font-black text-white ${activeTheme.button} active:scale-95 transition-transform flex items-center justify-center gap-2`}
                    >
                      EXPLORE <ChevronRight size={20} />
                    </button>
                  </div>

                  <button onClick={() => setInputWord(wordOfTheDay)} className="flex items-center gap-2 text-[10px] font-black opacity-60 hover:opacity-100 transition-opacity tracking-[0.2em] uppercase">
                    <Sparkles size={12} className={activeTheme.subText} /> Word of Day: <span className="underline italic ml-1">{wordOfTheDay}</span>
                  </button>
                </div>
              </div>

              {/* Loop Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`${activeTheme.card} p-7 rounded-[40px] flex flex-col justify-between h-36`}>
                   <div className="flex justify-between items-start">
                     <RotateCw className={activeTheme.subText} size={22} />
                     <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Queue</span>
                   </div>
                   <div className="text-5xl font-black tracking-tighter italic">{trainerQueue.length}</div>
                </div>
                <div 
                  onClick={() => setCurrentView('trainer')}
                  className={`${activeTheme.card} p-7 rounded-[40px] flex flex-col justify-between h-36 cursor-pointer active:scale-[0.98] transition-all`}
                >
                   <div className="flex justify-between items-start">
                     <Target className={activeTheme.subText} size={22} />
                     <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em]">Vortex</span>
                   </div>
                   <div className="flex items-center justify-between font-black text-xs uppercase tracking-widest">
                     Open <ChevronRight size={18} />
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'reading' && (
            <motion.div key="reading" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col gap-6">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-10">
                  <WordBuilderMiniGame />
                  <div className="text-center animate-pulse">
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Vortex Generation...</h3>
                    <p className="opacity-40 text-[10px] uppercase font-black tracking-[0.5em]">Catch the letters to stay sharp!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`${activeTheme.card} p-10 rounded-[56px] flex-1 flex flex-col overflow-y-auto no-scrollbar border-white/5`}>
                    <div className="flex justify-between items-center mb-10">
                       <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full ${activeTheme.accent}/10 ${activeTheme.subText}`}>{level} Drill</span>
                       <Trophy className={activeTheme.subText} size={24} />
                    </div>
                    
                    <div className="space-y-16">
                      <div className="font-serif leading-relaxed text-2xl">
                        <p className="opacity-90 leading-[2] italic text-center">
                          {currentStory?.story?.split(' ').map((w, i) => (
                            <span 
                              key={i} onClick={() => setSelectedWord(w.replace(/[.,!?;:]/g, ''))}
                              className={`inline-block mr-2 cursor-pointer rounded-xl px-1 hover:bg-white/10 transition-all ${w.toLowerCase().includes(currentStory.word.toLowerCase()) ? `${activeTheme.subText} font-black underline decoration-4 underline-offset-8` : ''}`}
                            >
                              {w}
                            </span>
                          ))}
                        </p>
                      </div>

                      <div className="pt-12 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-10">
                           <Lightbulb className={activeTheme.subText} size={20} />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Interactive Usage Vortex</h4>
                        </div>
                        
                        <div className="space-y-5">
                          {currentStory?.drills?.map((drill, i) => (
                            <motion.div 
                              key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                              className="group p-6 rounded-[32px] bg-white/5 border border-white/5 hover:border-white/20 transition-all relative"
                            >
                               <div className="flex flex-wrap items-center leading-relaxed">
                                  {drill.sentence.split(' ').map((w, idx) => (
                                    <span 
                                      key={idx} 
                                      onClick={() => setSelectedWord(w.replace(/[.,!?;:]/g, ''))}
                                      className={`inline-block mr-2 text-base cursor-pointer hover:text-blue-400 transition-all py-1 rounded-lg ${w.toLowerCase().includes(currentStory.word.toLowerCase()) ? 'text-blue-400 font-black' : 'opacity-60'}`}
                                    >
                                      {w}
                                    </span>
                                  ))}
                               </div>
                               <button 
                                onClick={() => setSelectedDrill(drill)}
                                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10 backdrop-blur-xl"
                               >
                                 <Info size={16} className={activeTheme.subText} />
                               </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-12 pb-6 text-center border-t border-white/5">
                         <span className="text-[10px] opacity-30 uppercase font-black tracking-[0.5em] block mb-4">Semantic Anchor</span>
                         <p className="text-4xl font-black tracking-tight bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent">{currentStory?.bengaliDefinition}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className={`${activeTheme.card} flex-1 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 ${activeTheme.button}`}><Volume2 size={20} /> Listen</button>
                    <button onClick={handleNext} className={`${activeTheme.accent} flex-[2.5] py-6 rounded-3xl font-black text-white shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all tracking-[0.2em]`}>NEXT DRILL <ChevronRight size={24} /></button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {currentView === 'trainer' && (
            <motion.div key="trainer" initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="space-y-8">
              <div className="flex items-center gap-5">
                <button onClick={() => setCurrentView('home')} className="p-3 bg-white/5 rounded-2xl"><ChevronRight className="rotate-180"/></button>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">Training Vortex</h2>
              </div>
              <div className="space-y-4">
                {trainerQueue.length === 0 ? (
                  <div className="text-center py-32 opacity-10"><BookOpen size={80} className="mx-auto mb-6" /><p className="font-black uppercase tracking-[0.5em] text-xs">Vortex Empty</p></div>
                ) : (
                  trainerQueue.map((item, idx) => (
                    <motion.div key={item.id} layout className={`${activeTheme.card} p-6 rounded-[32px] flex justify-between items-center border-white/5`}>
                       <div className="flex items-center gap-5">
                         <span className="text-sm font-black opacity-10">#0{idx+1}</span>
                         <div><h3 className="text-xl font-black tracking-tight">{item.word}</h3><span className="text-[10px] font-black opacity-30 uppercase tracking-widest">{item.level} Curriculum</span></div>
                       </div>
                       <button onClick={() => setTrainerQueue(q => q.filter(x => x.id !== item.id))} className="text-red-500/20 hover:text-red-500 transition-colors p-3"><Trash2 size={24}/></button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Vortex Navigation */}
      <div className="fixed bottom-10 left-10 right-10 z-30">
        <div className={`${activeTheme.card} p-3 rounded-[40px] flex justify-around items-center border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl`}>
          <button onClick={() => setCurrentView('home')} className={`p-5 rounded-[28px] transition-all ${currentView === 'home' ? activeTheme.accent + ' text-white shadow-2xl' : 'opacity-40 hover:opacity-100'}`}><Zap size={24}/></button>
          <button onClick={() => setCurrentView('trainer')} className={`p-5 rounded-[28px] transition-all ${currentView === 'trainer' ? activeTheme.accent + ' text-white shadow-2xl' : 'opacity-40 hover:opacity-100'}`}><RotateCw size={24}/></button>
          <button className="p-5 rounded-[28px] opacity-20 cursor-not-allowed"><Trophy size={24}/></button>
        </div>
      </div>

      {/* Modals (Theming, Insights, Drills) */}
      <AnimatePresence>
        {showThemePicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl p-10 flex flex-col">
            <div className="flex justify-between items-center mb-16"><h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Choose Universe</h2><button onClick={() => setShowThemePicker(false)} className="text-white bg-white/10 p-3 rounded-full"><X/></button></div>
            <div className="grid grid-cols-2 gap-5 flex-1 overflow-y-auto pb-20 no-scrollbar">
              {Object.entries(themes).map(([key, t]) => (
                <button key={key} onClick={() => { setThemeKey(key); setShowThemePicker(false); }} className={`${t.bg} border ${themeKey === key ? 'border-white scale-[1.02]' : 'border-white/10'} p-10 rounded-[56px] text-left transition-all h-56 flex flex-col justify-between group active:scale-95`}>
                  <span className={`${t.text} text-base font-black uppercase tracking-widest leading-none`}>{t.name}</span>
                  <div className={`w-12 h-12 rounded-full ${t.accent} shadow-2xl group-hover:scale-110 transition-transform`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className={`${activeTheme.card} p-12 rounded-[64px] w-full max-w-sm border-white/20 text-center`}>
              <h3 className="text-6xl font-black tracking-tighter mb-6 italic leading-none text-blue-400">"{selectedWord}"</h3>
              <p className="opacity-40 mb-12 italic text-sm font-bold leading-relaxed">Catch this word in your future Vortex stories by adding it to your training loop.</p>
              <div className="flex flex-col gap-4">
                <button onClick={() => addToTrainer(selectedWord)} className={`w-full py-6 rounded-[28px] ${activeTheme.accent} text-white font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs`}><Bookmark size={18} /> Add to Vortex</button>
                <button onClick={() => setSelectedWord(null)} className="w-full py-4 opacity-30 font-black uppercase tracking-widest text-[10px]">Abandon Insight</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDrill && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
            <motion.div initial={{ y: 300, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 300, opacity: 0 }} className={`${activeTheme.card} p-10 rounded-[56px] w-full max-w-md`}>
              <div className="flex justify-between items-start mb-8"><div className={`p-4 rounded-3xl ${activeTheme.accent}/10 text-blue-400 border border-blue-400/20`}><Lightbulb size={28} /></div><button onClick={() => setSelectedDrill(null)} className="opacity-20 p-2"><X size={24} /></button></div>
              <h4 className="text-[10px] font-black uppercase opacity-20 tracking-[0.5em] mb-6 text-center">Drill Insight</h4>
              <p className="text-2xl font-serif italic mb-10 leading-relaxed text-center opacity-90">"{selectedDrill.sentence}"</p>
              <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 mb-12 shadow-inner"><p className="text-base opacity-70 leading-relaxed italic text-center font-medium">"{selectedDrill.explanation}"</p></div>
              <div className="flex gap-4">
                <button onClick={() => addToTrainer(currentStory.word)} className={`flex-1 py-6 rounded-[24px] ${activeTheme.accent} text-white font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest`}><Bookmark size={16} /> Loop Core Word</button>
                <button onClick={() => setSelectedDrill(null)} className="px-8 rounded-[24px] bg-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Done</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;