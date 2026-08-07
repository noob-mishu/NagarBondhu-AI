import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
