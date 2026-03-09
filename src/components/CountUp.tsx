import React, { useState, useEffect } from 'react';
import { animate } from 'motion/react';

interface CountUpProps {
  value: number;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ value, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(latest)
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toFixed(0)}{suffix}</span>;
};
