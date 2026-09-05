import React from 'react';
import logoImage from '../../assets/dealflow360-logo.png';

export default function DealFlowLogo({ variant = 'sidebar', className = '' }) {
  let width, height, maxHeight;

  switch (variant) {
    case 'login':
      width = '100%';
      maxHeight = '90px'; // Approx 260-360px wide depending on aspect ratio
      break;
    case 'header':
      width = '140px';
      maxHeight = '40px';
      break;
    case 'portal':
      width = '180px';
      maxHeight = '48px';
      break;
    case 'sidebar':
    default:
      width = '160px';
      maxHeight = '48px';
      break;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }} className={className}>
      <img 
        src={logoImage}
        alt="DealFlow360 Logo" 
        style={{ 
          width: width,
          height: 'auto',
          maxHeight: maxHeight,
          objectFit: 'contain',
          objectPosition: 'left center'
        }} 
      />
    </div>
  );
}
