"use client";

import { useState, useEffect, useRef } from "react";

interface ReviewEmbedProps {
  src: string;
  name: string;
  url: string;
}

const IFRAME_BLOCKED = new Set([
  "ebay",
]);

function isLikelyBlocked(name: string): boolean {
  const lower = name.toLowerCase();
  return IFRAME_BLOCKED.has(lower) || lower.includes("ebay");
}

export default function ReviewEmbed({ src, name, url }: ReviewEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showFallback = error || isLikelyBlocked(name);

  useEffect(() => {
    if (showFallback) return;
    timerRef.current = setTimeout(() => {
      if (!loaded) setError(true);
    }, 8000);
    return () => clearTimeout(timerRef.current);
  }, [loaded, showFallback]);

  if (showFallback) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative bg-gradient-to-br from-slate-50 to-slate-100 group"
        style={{ height: 320 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-400 group-hover:text-navy transition-colors">
          <div className="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span className="text-base font-bold text-navy">{name}</span>
          <span className="text-sm text-slate-400 group-hover:text-navy transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Bekijk reviews op {name}
          </span>
        </div>
      </a>
    );
  }

  return (
    <div className="relative bg-slate-50" style={{ height: 420 }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-navy/20 border-t-navy rounded-full animate-spin" />
        </div>
      )}
      <iframe
        src={src}
        title={`${name} reviews`}
        className="w-full h-full border-0"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        sandbox="allow-scripts allow-same-origin allow-popups"
        loading="lazy"
        onLoad={() => {
          clearTimeout(timerRef.current);
          setLoaded(true);
        }}
        onError={() => setError(true)}
      />
    </div>
  );
}
