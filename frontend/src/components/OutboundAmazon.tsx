import React from 'react';
import { Button } from './Button';

interface OutboundAmazonProps {
  asin: string;
  brand?: string;
  modelName?: string;
  query?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const OutboundAmazon: React.FC<OutboundAmazonProps> = ({
  asin,
  brand,
  modelName,
  query,
  label = 'View on Amazon India',
  size = 'md',
  fullWidth = false
}) => {
  // Direct exact product page on Amazon.in using ASIN
  // Canonical product detail page URL: https://www.amazon.in/dp/{asin}?tag=consenzo-21
  const amazonUrl = asin
    ? `https://www.amazon.in/dp/${asin}?tag=consenzo-21`
    : `https://www.amazon.in/s?k=${encodeURIComponent(query || [brand, modelName].filter(Boolean).join(' '))}&tag=consenzo-21`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(amazonUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant="amazon"
      size={size}
      onClick={handleClick}
      style={{ width: fullWidth ? '100%' : 'auto' }}
      rightIcon={<span style={{ fontSize: '1.1rem' }}>↗</span>}
      title={`Open exact Amazon product page for ${modelName || brand || asin}`}
    >
      {label}
    </Button>
  );
};

