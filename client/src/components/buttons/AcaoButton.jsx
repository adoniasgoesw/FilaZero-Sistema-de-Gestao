import React from 'react';

const AcaoButton = ({ onClick, icon: Icon, color = 'blue', children, className = '', disabled = false, loading = false }) => {
  const colorClasses = {
    blue: 'text-blue-600 hover:bg-blue-50',
    green: 'text-green-600 hover:bg-green-50',
    red: 'text-red-600 hover:bg-red-50',
    orange: 'text-orange-600 hover:bg-orange-50'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`h-11 w-11 p-2 rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center ${
        disabled || loading
          ? 'opacity-50 cursor-not-allowed bg-gray-100' 
          : colorClasses[color]
      } ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  );
};

export default AcaoButton;
