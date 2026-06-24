import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface Countdown3DProps {
  targetDate: string;
}

export const Countdown3D: React.FC<Countdown3DProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!targetDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 text-center max-w-md w-full shadow-sm">
        <p className="text-red-700 font-bold text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 animate-bounce" />
          L'offerta speciale è scaduta! Il prezzo standard è ora attivo.
        </p>
      </div>
    );
  }

  const renderCard = (value: number, label: string) => {
    const formattedValue = String(value).padStart(2, '0');
    return (
      <div className="flex flex-col items-center">
        {/* 3D Digit Container */}
        <div 
          className="relative group perspective"
          style={{ perspective: '800px' }}
        >
          {/* Main 3D Box with shadow layers for real physical depth */}
          <div 
            className="w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 flex items-center justify-center border-t border-slate-700/80 shadow-[0_10px_20px_rgba(0,0,0,0.4),0_2px_4px_rgba(255,255,255,0.05)] transform-gpu transition-all duration-300 hover:scale-105 hover:-rotate-x-12 cursor-default relative overflow-hidden"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'rotateX(10deg)',
              boxShadow: '0 8px 0 #0f172a, 0 15px 25px rgba(0,0,0,0.5)'
            }}
          >
            {/* Light beam reflex */}
            <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none rounded-t-xl" />
            
            {/* Mid flip horizontal line */}
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/60 shadow-[0_1px_0_rgba(255,255,255,0.05)]" />

            {/* Glowing amber digit */}
            <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]">
              {formattedValue}
            </span>
          </div>
        </div>
        
        {/* Label beneath */}
        <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mt-4 tracking-widest">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800/80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] space-y-4 max-w-md w-full relative overflow-hidden border-b-4 border-b-amber-500/30">
      {/* Background soft lighting effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with pulsing alert beacon */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </div>
          <p className="text-xs font-extrabold tracking-wider uppercase text-amber-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> OFFERTA LIMITATA
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
          PREZZO IN AUMENTO
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
        Manca pochissimo prima che il prezzo speciale di lancio ritorni a quello di listino. Blocca la tua licenza ora:
      </p>

      {/* Grid of 3D Countdown card blocks */}
      <div className="flex justify-between items-center px-2 py-1">
        {renderCard(timeLeft.days, 'Giorni')}
        <span className="text-slate-700 font-extrabold text-xl mb-6 animate-pulse">:</span>
        {renderCard(timeLeft.hours, 'Ore')}
        <span className="text-slate-700 font-extrabold text-xl mb-6 animate-pulse">:</span>
        {renderCard(timeLeft.minutes, 'Minuti')}
        <span className="text-slate-700 font-extrabold text-xl mb-6 animate-pulse">:</span>
        {renderCard(timeLeft.seconds, 'Secondi')}
      </div>
    </div>
  );
};
