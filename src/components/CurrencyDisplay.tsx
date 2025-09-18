
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showToggle?: boolean;
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '',
  showToggle = true 
}) => {
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');
  
  const formatCurrency = (value: number, curr: 'KES' | 'USD') => {
    const exchangeRate = 150; // 1 USD = 150 KES (approximate)
    
    if (curr === 'KES') {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } else {
      const usdValue = value / exchangeRate;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(usdValue);
    }
  };

  const toggleCurrency = () => {
    if (showToggle) {
      setCurrency(currency === 'KES' ? 'USD' : 'KES');
    }
  };

  return (
    <span 
      className={cn(
        showToggle ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
        className
      )}
      onClick={toggleCurrency}
      title={showToggle ? 'Click to switch currency' : undefined}
    >
      {formatCurrency(amount, currency)}
    </span>
  );
};

export default CurrencyDisplay;
