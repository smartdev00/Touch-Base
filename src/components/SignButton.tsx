import { ReactNode } from 'react';

interface ISign {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: () => {};
}

export default function SignButton({ className, children, disabled, onClick }: ISign) {
  return (
    <button
      className={`bg-dark-green text-white text-center py-1.5 text-3xl ${className}`}
      disabled={disabled || false}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
