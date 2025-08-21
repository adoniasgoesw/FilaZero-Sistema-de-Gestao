import React from 'react';

const ConfirmButton = ({ 
  onClick, 
  children, 
  variant = 'blue', 
  disabled = false,
  className = ''
}) => {
  const baseClasses = "px-8 py-3 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variantClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default ConfirmButton;
