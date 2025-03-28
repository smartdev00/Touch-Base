import { ChangeEvent } from 'react';

interface ITextField {
  className?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function TextField({ className, placeholder, name, type, value, onChange }: ITextField) {
  return (
    <input
      className={`px-2 py-2 text-xl text-center ${className}`}
      placeholder={placeholder || ''}
      name={name}
      type={type || 'text'}
      value={value}
      onChange={onChange}
    />
  );
}
