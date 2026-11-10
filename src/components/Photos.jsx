import React, { useState } from 'react';

// Smooth scalloped 10-petal silhouette, responsive with a white outer outline.
const FLOWER_CLIP = `polygon(${Array.from({ length: 241 }, (_, i) => {
  const angle = i * Math.PI * 2 / 240 - Math.PI / 2;
  const radius = 39 + 10 * Math.cos(10 * (angle + Math.PI / 2));
  return `${(50 + Math.cos(angle) * radius).toFixed(2)}% ${(50 + Math.sin(angle) * radius).toFixed(2)}%`;
}).join(',')})`;

function PhotoContent({ src, alt, hint }) {
  const [failed, setFailed] = useState(false);
  return <div className="photo-content">
    {!failed && <img src={src} alt={alt} loading="eager" onError={() => setFailed(true)} />}
    {failed && <div className="photo-placeholder" role="img" aria-label={`Photo placeholder: ${alt}`}>
      <span className="placeholder-heart">♡</span>
      <span>Baby Ryn</span>
      <small>{hint}</small>
    </div>}
  </div>;
}

export function FlowerPhoto({ src, alt, hint, className = '' }) {
  return <div className={`flower-outline ${className}`} style={{ clipPath: FLOWER_CLIP }}>
    <div className="flower-inner" style={{ clipPath: FLOWER_CLIP }}>
      <PhotoContent key={src} src={src} alt={alt} hint={hint} />
    </div>
  </div>;
}

export function RoundedPhoto({ src, alt, hint }) {
  return <div className="rounded-photo"><PhotoContent key={src} src={src} alt={alt} hint={hint} /></div>;
}
