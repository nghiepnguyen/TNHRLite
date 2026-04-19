import React from 'react';
import './Skeleton.css';

/**
 * Reusable Skeleton component for loading states.
 * 
 * @param {string} variant - One of 'text', 'title', 'avatar', 'button', 'card', 'circle', 'rect'
 * @param {string} width - Custom CSS width
 * @param {string} height - Custom CSS height
 * @param {object} style - Additional inline styles
 * @param {string} className - Additional CSS classes
 */
export default function Skeleton({ 
  variant = 'text', 
  width, 
  height, 
  style, 
  className = '' 
}) {
  const variantClass = `skeleton-${variant}`;
  
  const inlineStyle = {
    ...(width && { width }),
    ...(height && { height }),
    ...style
  };

  return (
    <div 
      className={`skeleton ${variantClass} ${className}`} 
      style={inlineStyle}
    />
  );
}
