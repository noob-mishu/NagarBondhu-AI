import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_4px_14px_0_rgba(0,74,198,0.35)] hover:shadow-[0_6px_20px_rgba(0,74,198,0.25)] hover:-translate-y-0.5",
    outline: "bg-surface text-primary border border-primary hover:bg-surface-container-low",
    secondary: "bg-primary text-white hover:bg-on-primary-fixed-variant",
    ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-highest",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
