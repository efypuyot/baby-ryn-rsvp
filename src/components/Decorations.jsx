import React from 'react';

function Balloon({ className }) {
  return <svg className={className} viewBox="0 0 120 215" fill="none" aria-hidden="true">
    <path d="M60 3C31 3 6 28 6 64c0 36 28 65 38 87h32c10-22 38-51 38-87C114 28 89 3 60 3Z" fill="#9bcdf6" />
    <path d="M60 3C44 10 27 35 27 65s16 62 22 86h22c6-24 22-56 22-86S76 10 60 3Z" fill="#fff0d6" />
    <path d="M60 3c-7 12-12 34-12 62s7 61 9 86h6c2-25 9-58 9-86S67 15 60 3Z" fill="#9bcdf6" />
    <path d="M6 64C6 29 31 3 60 3c29 0 54 26 54 61" stroke="#8bc4f2" strokeWidth="1.5" />
    <path d="M24 151 45 179M96 151 75 179M60 151v29" stroke="#275d90" strokeWidth="2" />
    <path d="M42 148h36v18H42z" fill="#fff0d6" />
    <path d="M44 180h32v18c0 7-6 13-13 13H57c-7 0-13-6-13-13v-18Z" fill="#e9ab92" />
    <path d="M44 180c4 11 11 11 16 0 5 11 12 11 16 0" fill="#fff0d6" />
  </svg>;
}

function Cloud({ className }) {
  return <svg className={className} viewBox="0 0 210 115" aria-hidden="true">
    <path d="M35 96C16 96 5 84 5 70c0-17 13-31 31-31 5-23 22-34 39-34 24 0 37 15 42 33 9-10 23-11 34-4 12 7 16 17 15 28 21-4 39 8 39 24 0 17-17 25-33 25H35Z" fill="currentColor" />
  </svg>;
}

function Petal({ className }) {
  return <svg className={className} viewBox="0 0 130 130" aria-hidden="true">
    <path d="M65 49C41-9 8 14 29 57c-50-17-48 30 4 28-24 44 23 57 37 14 24 51 64 16 31-17 45-1 30-47-7-32C116 10 77-8 65 49Z" fill="currentColor" />
  </svg>;
}

export function Decorations() {
  return <div className="decorations" aria-hidden="true">
    <Cloud className="cloud cloud-top-left" /><Cloud className="cloud cloud-top-right" />
    <Cloud className="cloud cloud-bottom-left" /><Cloud className="cloud cloud-bottom-right" />
    <Balloon className="balloon balloon-right" /><Balloon className="balloon balloon-left" />
    <Petal className="petal petal-left" /><Petal className="petal petal-right" />
  </div>;
}
