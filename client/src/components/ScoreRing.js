import React, { useEffect, useState } from 'react';

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreRing({ score, color, size = 160 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate score on mount / change
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = score;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [score]);

  const offset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      aria-label={`Wash score: ${score} out of 100`}
      role="img"
    >
      {/* Track */}
      <circle
        cx="70" cy="70" r={RADIUS}
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="10"
      />
      {/* Score arc */}
      <circle
        cx="70" cy="70" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
        style={{ transition: 'stroke 0.4s ease' }}
      />
      {/* Score number */}
      <text
        x="70" y="64"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="32"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        fill={color}
      >
        {animatedScore}
      </text>
      <text
        x="70" y="88"
        textAnchor="middle"
        fontSize="11"
        fontFamily="Inter, sans-serif"
        fill="#888780"
      >
        wash score
      </text>
    </svg>
  );
}
