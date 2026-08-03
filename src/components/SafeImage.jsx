import React, { useState } from 'react';

export default function SafeImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`bg-stone-card border border-stone-border flex items-center justify-center p-2 text-center text-bronze-gold font-serif text-[10px] uppercase select-none ${className || ''}`}
      >
        <span>{alt || 'ARCHIVE MEDIA'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'Archive Media'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
