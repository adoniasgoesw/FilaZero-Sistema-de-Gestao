import React from 'react';

const CancelButton = ({ 
  onClick, 
  children, 
  disabled = false,
  className = ''
}) => {
  const baseClasses = "px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl transition-all duration-200 text-base border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default CancelButton;
