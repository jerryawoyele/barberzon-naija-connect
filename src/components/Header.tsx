
import React from 'react';
import { ArrowLeft, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const Header = ({ title, showBack, onBack, rightAction }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
      <div className="flex items-center">
        {showBack ? (
          <button
            onClick={onBack}
            className="mr-3 p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        ) : (
          <Menu size={20} className="text-gray-600" />
        )}
        {title && (
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        )}
      </div>
      {rightAction && (
        <div>{rightAction}</div>
      )}
    </header>
  );
};

export default Header;
