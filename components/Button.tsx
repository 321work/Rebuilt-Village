import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = [
    'inline-flex items-center justify-center',
    'font-mono font-bold uppercase tracking-widest',
    'transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background',
    'disabled:opacity-40 disabled:pointer-events-none',
    'transform hover:-translate-y-0.5',
  ].join(' ');

  const variants = {
    // Brand gold fill — primary CTA (black text on gold, 9.2:1 contrast)
    primary: [
      'bg-primary text-primary-foreground',
      'hover:bg-brand-gold-light hover:shadow-gold',
      'active:translate-y-0',
    ].join(' '),

    // Gold fill with shimmer — high-impact donate / featured CTAs
    gold: [
      'bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light',
      'text-brand-black',
      'hover:from-brand-gold hover:via-brand-gold-light hover:to-brand-gold',
      'hover:shadow-gold-lg glow-gold',
      'active:translate-y-0',
    ].join(' '),

    // Secondary fill — less prominent actions
    secondary: [
      'bg-surface text-text border border-border',
      'hover:bg-surface-highlight hover:border-primary',
      'active:translate-y-0',
    ].join(' '),

    // Outline — ghost with border, used on dark backgrounds
    outline: [
      'border border-primary/40 bg-transparent',
      'text-primary-text',
      'hover:border-primary hover:bg-primary/8 hover:shadow-gold',
      'active:translate-y-0',
    ].join(' '),

    // Ghost — minimal, for tertiary actions
    ghost: [
      'bg-transparent text-text-muted',
      'hover:bg-surface-highlight hover:text-text',
    ].join(' '),
  };

  const sizes = {
    sm: 'h-8 px-5 text-[10px]',
    md: 'h-11 px-7 text-xs',
    lg: 'h-14 px-10 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
