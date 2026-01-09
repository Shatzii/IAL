
import React, { useState, useEffect } from 'react';

export const DraftClock: React.FC = () => {
  const targetDate = new Date('2026-03-01T00:00:00').getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft(prev => ({ ...prev, isLive: true }));
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          isLive: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isLive) {
    return (
      <div className="flex items-center gap-3 px-4 py-1.5 bg-league-accent/10 border border-league-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(228,29,36,0.2)]">
        <span className="w-1.5 h-1.5 bg-league-accent rounded-full shadow-[0_0_8px_#e41d24]" />
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white">Draft Protocol Live</span>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex flex-col items-end">
      <div className="flex items-center gap-1.5 mb-0.5">
         <span className="text-[7px] font-black text-league-accent uppercase tracking-widest italic opacity-80">Draft Commences In:</span>
         <span className="w-1 h-1 bg-league-ok rounded-full animate-pulse" />
      </div>
      <div className="flex items-center gap-3 font-mono">
        <TimeUnit val={timeLeft.days} label="D" />
        <span className="text-league-muted text-[10px] font-black opacity-30">:</span>
        <TimeUnit val={timeLeft.hours} label="H" />
        <span className="text-league-muted text-[10px] font-black opacity-30">:</span>
        <TimeUnit val={timeLeft.minutes} label="M" />
        <span className="text-league-muted text-[10px] font-black opacity-30">:</span>
        <TimeUnit val={timeLeft.seconds} label="S" color="text-league-accent" />
      </div>
    </div>
  );
};

const TimeUnit = ({ val, label, color = 'text-white' }: { val: number, label: string, color?: string }) => (
  <div className="flex items-baseline gap-0.5">
    <span className={`text-[12px] md:text-[14px] font-black italic tracking-tighter ${color}`}>
      {val.toString().padStart(2, '0')}
    </span>
    <span className="text-[7px] font-bold text-league-muted uppercase opacity-40">{label}</span>
  </div>
);
