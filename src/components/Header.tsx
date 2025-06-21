
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

const Header = ({ title, showBack, onBack, rightAction, className = '' }: HeaderProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm ${className}`}>
      <div className="flex items-center">
        {showBack && (
          <button
            onClick={onBack}
            className="mr-3 p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}
        {title && (
          <h1 className="text-xl font-semibold text-gray-900 animate-fade-in">{title}</h1>
        )}
      </div>
      {rightAction && (
        <div className="animate-fade-in">{rightAction}</div>
      )}
    </header>
  );
};

export default Header;
