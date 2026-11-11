import React, { useEffect, useState } from 'react';

/** Displays real photos while safely falling back to a branded placeholder. */
function PhotoContent({ src, alt, hint }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);
  return (
    <div className="photo-content">
      {!failed && (
        <img src={src} alt={alt} onError={() => setFailed(true)} loading="eager" decoding="async" />
      )}
      {failed && (
        <div className="photo-placeholder" role="img" aria-label={alt}>
          <svg className="placeholder-heart" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
          <span>Baby Ryn</span>
          {hint && <small>Add {hint} to public/images/</small>}
        </div>
      )}
    </div>
  );
}

export function FlowerPhoto({ src, alt, hint, className = '' }) {
  return (
    <div className={`flower-outline ${className}`}>
      <div className="flower-inner">
        <PhotoContent src={src} alt={alt} hint={hint} />
      </div>
    </div>
  );
}

export function RoundedPhoto({ src, alt, hint, className = '' }) {
  return (
    <div className={`rounded-photo ${className}`}>
      <PhotoContent src={src} alt={alt} hint={hint} />
    </div>
  );
}
