import React from 'react';

export const ScalarEyeLogo = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#42c3f5" />
        <stop offset="100%" stopColor="#1c75ae" />
      </linearGradient>
      <linearGradient id="pupilGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1d3855" />
        <stop offset="100%" stopColor="#1c75ae" />
      </linearGradient>
    </defs>

    {/* Outer Eye Shape */}
    <path 
      d="M5 50 C25 20, 75 20, 95 50 C75 80, 25 80, 5 50 Z" 
      fill="none" 
      stroke="url(#eyeGradient)" 
      strokeWidth="6" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Inner Pupil Circle */}
    <circle cx="50" cy="50" r="16" fill="url(#pupilGradient)" />

    {/* Data / Scalar Bars overlapping the pupil */}
    <rect x="36" y="38" width="6" height="24" fill="#42c3f5" rx="3" />
    <rect x="46" y="30" width="8" height="40" fill="#c2e1ef" rx="4" />
    <rect x="58" y="38" width="6" height="24" fill="#42c3f5" rx="3" />
    
    {/* High-tech accent dot */}
    <circle cx="50" cy="50" r="3" fill="#ffffff" />
    
    {/* Wrapping Circle */}
    <circle 
      cx="50" 
      cy="50" 
      r="48" 
      fill="none" 
      stroke="url(#eyeGradient)" 
      strokeWidth="2" 
      strokeDasharray="4,2"
      opacity="0.5"
    />
  </svg>
);

export const coat_of_arms = 'https://www.pngplay.com/wp-content/uploads/10/Zimbabwe-Flag-Background-PNG-Image.png'
export const bg_image = 'https://www.uz.ac.zw/images/uzfrontgallery_2/Administration%20Block.png'
export const scalareye_logo_svg = ScalarEyeLogo;

