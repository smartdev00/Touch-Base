import Link from 'next/link';
import { Children, ReactNode } from 'react';

interface IButton {
  className?: string;
  variant?: string;
  onClick?: () => void;
  children?: ReactNode;
}

interface ILinkButton {
  className?: string;
  href: string;
  children?: ReactNode;
}

interface IItemButton {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export default function Button({ className, variant, onClick, children }: IButton) {
  const buttonColor =
    variant === 'red' ? 'bg-light-red text-white hover:bg-red-400' : 'bg-light-blue text-dark hover:bg-blue-400';
  return (
    <button className={`rounded-full text-center text-dark ${className} ${buttonColor}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function LinkButton({ className, href, children }: ILinkButton) {
  return (
    <Link
      href={href}
      className={`rounded-full text-center bg-light-blue text-dark inline-flex items-center gap-1 px-5 py-0.5 text-sm hover:bg-blue-300 transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}

export function ItemButton({ children, className, onClick }: IItemButton) {
  return (
    <button className={`border border-dark rounded-md px-3 py-1 text-sm transition-colors ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
