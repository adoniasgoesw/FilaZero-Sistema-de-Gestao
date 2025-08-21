import React from 'react';
import loadingImg from '/src/assets/loading.png';
import acceptImg from '/src/assets/accept.png';
import errorImg from '/src/assets/error.png';

const colors = {
  loading: '#1A99BA',
  success: '#28a745',
  error: '#dc3545',
};

const images = {
  loading: loadingImg,
  success: acceptImg,
  error: errorImg,
};

const Loading = ({ status = 'loading', message = '' }) => {
  const color = colors[status];
  const image = images[status];

  return (
    <div className="flex flex-col items-center mt-4 select-none transition-all duration-500 ease-in-out">
      <div className="w-16 h-16 mb-2 animate-spin transition-all duration-500 ease-in-out">
        <img
          key={status}
          src={image}
          alt={`${status} icon`}
          className="w-16 h-16 object-contain transition-opacity duration-500"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          draggable={false}
        />
      </div>

      {message && (
        <p
          className="text-center font-medium text-sm transition-colors duration-500"
          style={{ color }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;
  