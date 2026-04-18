import React, { useEffect, useState, useCallback } from 'react';

interface TextScrambleProps {
  text: string;
  autostart?: boolean;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const TextScramble: React.FC<TextScrambleProps> = ({ text, autostart = true }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const scramble = useCallback(async () => {
    if (isScrambling) return;
    setIsScrambling(true);

    const length = text.length;
    let frames = 0;
    const maxFrames = 15;

    const interval = setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((_, i) => {
            if (i < (frames / maxFrames) * length) {
              return text[i];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      frames++;
      if (frames > maxFrames) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, 40);
  }, [text, isScrambling]);

  useEffect(() => {
    if (autostart) {
      scramble();
    }
  }, [autostart, scramble]);

  return (
    <span 
      onMouseEnter={scramble}
      className="inline-block cursor-default font-mono"
    >
      {displayText}
    </span>
  );
};

export default TextScramble;
