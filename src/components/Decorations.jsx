import React from 'react';

/** Non-interactive invitation illustrations, built from SVG rather than emoji. */
function Cloud({ className }) {
  return (
    <svg className={`cloud ${className}`} viewBox="0 0 310 160" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="51" cy="89" r="56" />
      <circle cx="109" cy="69" r="63" />
      <circle cx="179" cy="45" r="66" />
      <circle cx="248" cy="88" r="61" />
      <rect x="31" y="74" width="240" height="84" rx="40" />
    </svg>
  );
}

function Balloon({ className }) {
  return (
    <svg className={`balloon ${className}`} viewBox="0 0 145 260" fill="none" aria-hidden="true" focusable="false">
      <path d="M72.5 6C37 6 11 34 11 76c0 38 22 76 46 105h31c24-29 46-67 46-105 0-42-26-70-61.5-70Z" fill="#8ac8f5" />
      <path d="M72.5 6C55 6 42 36 42 75c0 39 11 77 22 106h17c11-29 22-67 22-106C103 36 90 6 72.5 6Z" fill="#fff0d6" />
      <path d="M72.5 6c-8 0-13 34-13 70 0 40 5 79 10 105h7c5-26 10-65 10-105 0-36-5-70-14-70Z" fill="#8ac8f5" />
      <path d="M21 181h103l-15 24H36Z" fill="#fff0d6" />
      <path d="m23 183 37 57m62-57-36 57M59 205v35m27-35v35" stroke="#315e8c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M56 239h33v7c0 8-6 13-14 13h-5c-8 0-14-5-14-13z" fill="#e7ad93" />
      <path d="M56 239q5 11 11 0 5 11 11 0 6 11 11 0" stroke="#fff0d6" strokeWidth="3.5" fill="none" />
    </svg>
  );
}

function Blossom({ className }) {
  return (
    <svg className={`petal ${className}`} viewBox="0 0 120 110" fill="currentColor" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="33" rx="24" ry="31" />
      <ellipse cx="91" cy="48" rx="25" ry="30" transform="rotate(65 91 48)" />
      <ellipse cx="77" cy="81" rx="25" ry="29" transform="rotate(135 77 81)" />
      <ellipse cx="43" cy="81" rx="25" ry="29" transform="rotate(-135 43 81)" />
      <ellipse cx="29" cy="48" rx="25" ry="30" transform="rotate(-65 29 48)" />
      <circle cx="60" cy="58" r="19" />
    </svg>
  );
}

export function Decorations() {
  return (
    <div className="decorations" aria-hidden="true">
      <Cloud className="cloud-top-left" />
      <Cloud className="cloud-top-right" />
      <Cloud className="cloud-bottom-left" />
      <Cloud className="cloud-bottom-right" />
      <Balloon className="balloon-right" />
      <Balloon className="balloon-left" />
      <Blossom className="petal-left" />
      <Blossom className="petal-right" />
    </div>
  );
}
