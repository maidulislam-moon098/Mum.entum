import React from 'react';

const Logo = ({ height = '40px' }) => {
  return (
    <svg 
      height={height} 
      viewBox="0 0 600 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 'auto' }}
    >
      {/* Butterfly/Heart Icon */}
      <path 
        d="M60 30C60 13.4315 46.5685 0 30 0C13.4315 0 0 13.4315 0 30C0 46.5685 13.4315 60 30 60C30 76.5685 43.4315 90 60 90C76.5685 90 90 76.5685 90 60C90 43.4315 76.5685 30 60 30Z" 
        fill="#F5A5C0"
      />
      <path 
        d="M120 30C120 13.4315 106.569 0 90 0C73.4315 0 60 13.4315 60 30C60 46.5685 73.4315 60 90 60C90 76.5685 103.431 90 120 90C136.569 90 150 76.5685 150 60C150 43.4315 136.569 30 120 30Z" 
        fill="#F5A5C0"
      />
      
      {/* Text: Mum.entum */}
      <text 
        x="170" 
        y="70" 
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" 
        fontSize="48" 
        fontWeight="400" 
        fill="#F5A5C0"
        letterSpacing="-0.02em"
      >
        Mum.entum
      </text>
    </svg>
  );
};

export default Logo;
