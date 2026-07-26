import React from 'react';

const ClarityAILogo = ({ className = "w-10 h-10" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
    <defs>
      {/* Gradient for outer C ring & sparkle */}
      <linearGradient id="clarityRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="45%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      
      {/* Gradient for upward growth line */}
      <linearGradient id="clarityLineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      
      {/* Gradient for bar charts */}
      <linearGradient id="clarityBarGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>

    {/* Outer C Ring */}
    <path d="M 68 18.5 A 38 38 0 1 0 71 80" 
          fill="none" 
          stroke="url(#clarityRingGrad)" 
          strokeWidth="11" 
          strokeLinecap="round" />

    {/* Financial Bar Charts (Progressive Heights) */}
    <rect x="36" y="55" width="7" height="15" rx="3.5" fill="url(#clarityBarGrad)" />
    <rect x="47" y="47" width="7" height="23" rx="3.5" fill="url(#clarityBarGrad)" />
    <rect x="58" y="38" width="7.5" height="32" rx="3.75" fill="url(#clarityBarGrad)" />

    {/* Upward Analytics Line with Nodes */}
    <line x1="28" y1="58" x2="52" y2="35" stroke="url(#clarityLineGrad)" strokeWidth="5" strokeLinecap="round" />
    <circle cx="28" cy="58" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
    <circle cx="52" cy="35" r="4.5" fill="#6366F1" />

    {/* AI Intelligence Four-Point Sparkle Star */}
    <path d="M 72 26 Q 72 20 78 20 Q 72 20 72 14 Q 72 20 66 20 Q 72 20 72 26 Z" fill="#8B5CF6" />
  </svg>
);

export default ClarityAILogo;
