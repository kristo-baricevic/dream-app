'use client';
import { useEffect, useState } from 'react';

const TypewriterText = ({ text, speed = 25 }: { text: string; speed?: number }) => {
  const [out, setOut] = useState('');
  useEffect(() => {
    let i = 0;
    setOut('');
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <span>{out}</span>;
};

export default TypewriterText;
