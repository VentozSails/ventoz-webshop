"use client";

import { useState } from "react";

interface ReviewEmbedProps {
  src: string;
  name: string;
  url: string;
}

export default function ReviewEmbed({ src, name, url }: ReviewEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative bg-gradient-to-br from-slate-50 to-slate-100"
        style={{ height: 420 }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-navy transition-colors cursor-pointer">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-sm font-medium">
            {name}
          </span>
          <span className="text-xs">Click to open</span>
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
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
