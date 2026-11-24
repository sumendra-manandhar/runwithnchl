import React, { useEffect, useState } from 'react';

interface Props {
  targetDate: string;
}

export const CountdownTimer: React.FC<Props> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const blocks = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HRS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEC', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-2.5 sm:gap-3">
      {blocks.map((b) => (
        <div
          key={b.label}
          className="flex min-w-[60px] flex-col items-center rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 backdrop-blur"
        >
          <span className="text-xl font-black text-lime-400 sm:text-2xl">
            {String(b.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400">
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
};
