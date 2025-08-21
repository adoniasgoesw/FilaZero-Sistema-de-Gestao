import React from 'react';

const BaseList = ({ children, className = "", title, subtitle }) => {
  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
      )}
      
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {children}
      </div>
    </div>
  );
};

export default BaseList;
